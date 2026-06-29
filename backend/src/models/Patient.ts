import { Schema, model, HydratedDocument } from "mongoose";

export interface Patient {
  nome: string;
  telefone: string;
  convenio: string;
  endereco: {
    rua: string;
    bairro: string;
    cidade: string;
    cep: string;
  };
  observacoes?: string;
  ativo: boolean;
}

const patientSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    telefone: { type: String, required: true, trim: true },
    convenio: { type: String, required: true, trim: true },
    endereco: {
      rua: { type: String, required: true, trim: true },
      bairro: { type: String, required: true, trim: true },
      cidade: { type: String, required: true, trim: true },
      cep: { type: String, required: true, trim: true },
    },
    observacoes: { type: String, default: "" },
    ativo: { type: Boolean, default: true },
  },
  {
    versionKey: false,
  },
);

patientSchema.index({ nome: 1 });
patientSchema.index({ "endereco.bairro": 1 });

export type PatientDocument = HydratedDocument<Patient>;

export const PatientModel = model<Patient>("Patient", patientSchema);
