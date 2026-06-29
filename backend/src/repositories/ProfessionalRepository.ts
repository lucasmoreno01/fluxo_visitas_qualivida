import { Types } from "mongoose";
import {
  Professional,
  ProfessionalDocument,
  ProfessionalModel,
} from "../models";

export class ProfessionalRepository {
  findById(id: string | Types.ObjectId): Promise<ProfessionalDocument | null> {
    return ProfessionalModel.findById(id).exec();
  }

  findByUserId(usuarioId: string | Types.ObjectId): Promise<ProfessionalDocument | null> {
    return ProfessionalModel.findOne({ usuarioId }).exec();
  }

  findActive(): Promise<ProfessionalDocument[]> {
    return ProfessionalModel.find({ ativo: true }).sort({ tipo: 1 }).exec();
  }

  create(data: Professional): Promise<ProfessionalDocument> {
    return ProfessionalModel.create(data);
  }
}
