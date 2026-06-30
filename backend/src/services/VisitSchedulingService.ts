import { Types } from "mongoose";
import {
  UserRole,
  VISIT_DURATION_IN_MINUTES,
  VisitStatus,
  VisitType,
} from "../domain/enums";
import { AppError } from "../errors/AppError";
import { VisitDocument, VisitEntity } from "../models";
import {
  PatientRepository,
  ProfessionalRepository,
  VisitRepository,
} from "../repositories";

export type ScheduleVisitInput = {
  pacienteId: string;
  profissionalId: string;
  tipo: VisitType;
  dataHoraInicio: string | Date;
};

export type ScheduleVisitActor = {
  usuarioId: string;
  role: UserRole;
};

export class VisitSchedulingService {
  constructor(
    private readonly visitRepository = new VisitRepository(),
    private readonly patientRepository = new PatientRepository(),
    private readonly professionalRepository = new ProfessionalRepository(),
  ) {}

  async scheduleVisit(
    input: ScheduleVisitInput,
    actor: ScheduleVisitActor,
  ): Promise<VisitDocument> {
    if (actor.role !== UserRole.ADMIN) {
      throw new AppError("Usuario sem permissao para agendar visitas.", 403);
    }

    const pacienteId = this.parseObjectId(
      input.pacienteId,
      "Paciente invalido.",
    );
    const profissionalId = this.parseObjectId(
      input.profissionalId,
      "Profissional invalido.",
    );
    const tipo = this.parseVisitType(input.tipo);
    const dataHoraInicio = this.parseStartDate(input.dataHoraInicio);
    const dataHoraFim = this.calculateEndDate(dataHoraInicio, tipo);

    const [patient, professional, hasOverlap] = await Promise.all([
      this.patientRepository.findById(pacienteId),
      this.professionalRepository.findById(profissionalId),
      this.visitRepository.hasOverlappingVisit({
        profissionalId,
        dataHoraInicio,
        dataHoraFim,
      }),
    ]);

    if (!patient || !patient.ativo) {
      throw new AppError("Paciente nao encontrado ou inativo.", 404);
    }

    if (!professional || !professional.ativo) {
      throw new AppError("Profissional nao encontrado ou inativo.", 404);
    }

    if (hasOverlap) {
      throw new AppError(
        "Profissional ja possui visita com horario sobreposto.",
        422,
      );
    }

    const visit: VisitEntity = {
      pacienteId,
      profissionalId,
      tipo,
      status: VisitStatus.AGENDADA,
      dataHoraInicio,
      dataHoraFim,
      motivoCancelamento: null,
      historico: [
        {
          statusAnterior: VisitStatus.AGENDADA,
          statusNovo: VisitStatus.AGENDADA,
          timestamp: new Date(),
          usuarioId: new Types.ObjectId(actor.usuarioId),
        },
      ],
    };
    const createdVisit = await this.visitRepository.create(visit);

    return createdVisit;
  }

  private parseObjectId(value: string, message: string): Types.ObjectId {
    if (!value || !Types.ObjectId.isValid(value)) {
      throw new AppError(message, 400);
    }

    return new Types.ObjectId(value);
  }

  private parseVisitType(value: VisitType): VisitType {
    if (!Object.values(VisitType).includes(value)) {
      throw new AppError("Tipo de visita invalido.", 400);
    }

    return value;
  }

  private parseStartDate(value: string | Date): Date {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError("Data de inicio invalida.", 400);
    }

    return parsedDate;
  }

  private calculateEndDate(startDate: Date, visitType: VisitType): Date {
    const durationInMinutes = VISIT_DURATION_IN_MINUTES[visitType];

    return new Date(startDate.getTime() + durationInMinutes * 60 * 1000);
  }
}
