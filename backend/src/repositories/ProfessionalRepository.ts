import { QueryFilter, Types } from "mongoose";
import {
  Professional,
  ProfessionalDocument,
  ProfessionalModel,
} from "../models";


export type ProfessionalListFilters = {
  ativo?: boolean;
  page?: number;
  limit?: number;
};
export class ProfessionalRepository {
  findById(id: string | Types.ObjectId): Promise<ProfessionalDocument | null> {
    return ProfessionalModel.findById(id).exec();
  }

  findByUserId(
    usuarioId: string | Types.ObjectId,
  ): Promise<ProfessionalDocument | null> {
    return ProfessionalModel.findOne({ usuarioId }).exec();
  }

  findActive(): Promise<ProfessionalDocument[]> {
    return ProfessionalModel.find({ ativo: true }).sort({ tipo: 1 }).exec();
  }

  create(data: Professional): Promise<ProfessionalDocument> {
    return ProfessionalModel.create(data);
  }

  async findMany(
    filters: ProfessionalListFilters,
  ): Promise<ProfessionalDocument[]> {
    const query: QueryFilter<Professional> = {};

    if (filters.ativo !== undefined) {
      query.ativo = filters.ativo;
    }

    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(Math.max(filters.limit ?? 10, 1), 100);

    return ProfessionalModel.find(query)
      .populate("usuarioId")
      .sort({ especialidade: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  

  async count(filters: ProfessionalListFilters): Promise<number> {
    const query: QueryFilter<Professional> = {};

    if (filters.ativo !== undefined) {
      query.ativo = filters.ativo;
    }

    return ProfessionalModel.countDocuments(query).exec();
  }
}
