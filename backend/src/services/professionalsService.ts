import { Types } from "mongoose";
import { AppError } from "../errors/AppError";
import { VisitDocument } from "../models";
import { ProfessionalRepository, VisitRepository } from "../repositories";

export class ProfessionalsService {
  constructor(
    private readonly professionalRepository = new ProfessionalRepository(),
    private readonly visitRepository = new VisitRepository(),
  ) {}

  async getAgenda(
    profissionalId: string,
    data?: string,
  ): Promise<VisitDocument[]> {
    if (!Types.ObjectId.isValid(profissionalId)) {
      throw new AppError("Profissional invalido.", 400);
    }

    const professional =
      await this.professionalRepository.findById(profissionalId);

    if (!professional) {
      throw new AppError("Profissional nao encontrado.", 404);
    }

    return this.visitRepository.findAgendaDoDia(
      profissionalId,
      data ? new Date(data) : new Date(),
    );
  }
}
