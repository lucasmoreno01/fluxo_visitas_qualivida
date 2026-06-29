import { Schema, model, HydratedDocument, Types } from "mongoose";
import { ProfessionalType } from "../domain/enums";

export interface Professional {
  usuarioId: Types.ObjectId;
  tipo: ProfessionalType;
  especialidade: string;
  ativo: boolean;
  maxVisitasDia: number;
}

const professionalSchema = new Schema(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tipo: {
      type: String,
      enum: Object.values(ProfessionalType),
      required: true,
    },
    especialidade: { type: String, required: true, trim: true },
    ativo: { type: Boolean, default: true },
    maxVisitasDia: { type: Number, required: true, min: 1 },
  },
  {
    versionKey: false,
  },
);

professionalSchema.index({ usuarioId: 1 }, { unique: true });

export type ProfessionalDocument = HydratedDocument<Professional>;

export const ProfessionalModel = model<Professional>(
  "Professional",
  professionalSchema,
);
