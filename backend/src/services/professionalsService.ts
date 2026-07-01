import { Types } from "mongoose";
import { AppError } from "../errors/AppError";
import { VisitDocument } from "../models";
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
