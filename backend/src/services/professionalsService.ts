import { Types } from "mongoose";
import { AppError } from "../errors/AppError";
import { VisitDocument } from "../models";
import { VisitStatus } from "../domain/enums";
import { ProfessionalListFilters, ProfessionalRepository } from "../repositories/ProfessionalRepository";
import { VisitRepository } from "../repositories/VisitRepository";

export class ProfessionalsService {
  constructor(
    private readonly professionalRepository = new ProfessionalRepository(),
    private readonly visitRepository = new VisitRepository(),
  ) {}

  async getAgenda(
    profissionalId: string,
    data?: string,
  ): Promise<{ visitas: VisitDocument[]; vagasRestantes: number }> {
    if (!Types.ObjectId.isValid(profissionalId)) {
      throw new AppError("Profissional invalido.", 400);
    }

    const professional =
      await this.professionalRepository.findById(profissionalId);

    if (!professional) {
      throw new AppError("Profissional nao encontrado.", 404);
    }

    const date = data ? new Date(data) : new Date();
    const agenda = await this.visitRepository.findAgendaDoDia(
      profissionalId,
      date,
    );

    const activeVisits = agenda.filter(
      (visit) => visit.status !== VisitStatus.CANCELADA,
    );
    const vagasRestantes = Math.max(0, professional.maxVisitasDia - activeVisits.length);

    return {
      visitas: agenda,
      vagasRestantes,
    };
  }

  async list(filters: ProfessionalListFilters) {
    const [items, total] = await Promise.all([
      this.professionalRepository.findMany(filters),
      this.professionalRepository.count(filters),
    ]);

    return {
      items,
      total,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };
  }
}
