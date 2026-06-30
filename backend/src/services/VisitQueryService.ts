import { Types } from "mongoose";
import { AppError } from "../errors/AppError";
import { VisitDocument } from "../models";
import { VisitListFilters, VisitRepository } from "../repositories";

export class VisitQueryService {
  constructor(
    private readonly visitRepository = new VisitRepository(),
    // private readonly patientRepository = new PatientRepository(),
    // private readonly professionalRepository = new ProfessionalRepository(),
  ) {}
  async listVisits(filters: VisitListFilters) {
    const [items, total] = await Promise.all([
      this.visitRepository.findMany(filters),
      this.visitRepository.count(filters),
    ]);

    return {
      items,
      total,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };
  }

  async findById(id: string): Promise<VisitDocument> {
    if (!Types.ObjectId.isValid(id)) {
  throw new AppError("Id da visita invalido.", 400);
}
    
    const visit = await this.visitRepository.findByIdWithDetails(id);

    if (!visit) {
      throw new AppError("Visita nao encontrada.", 404);
    }

    return visit;
  }
}
