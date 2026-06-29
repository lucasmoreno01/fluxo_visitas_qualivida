import { Types } from "mongoose";
import { Patient, PatientDocument, PatientModel } from "../models";

export class PatientRepository {
  findById(id: string | Types.ObjectId): Promise<PatientDocument | null> {
    return PatientModel.findById(id).exec();
  }

  findActive(): Promise<PatientDocument[]> {
    return PatientModel.find({ ativo: true }).sort({ nome: 1 }).exec();
  }

  create(data: Patient): Promise<PatientDocument> {
    return PatientModel.create(data);
  }
}
