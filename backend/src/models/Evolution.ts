import { Schema, model, HydratedDocument, Types } from "mongoose";

export interface VitalSigns {
  pressao?: string;
  temperatura?: number | null;
  saturacao?: number | null;
  frequenciaCardiaca?: number | null;
}

export interface Evolution {
  visitaId: Types.ObjectId;
  profissionalId: Types.ObjectId;
  observacoes: string;
  sinaisVitais?: VitalSigns;
  procedimentosRealizados?: string;
  intercorrencias?: string;
  proximaVisitaRecomendada?: Date | null;
  criadoEm?: Date;
}

const vitalSignsSchema = new Schema(
  {
    pressao: { type: String, default: "" },
    temperatura: { type: Number, default: null },
    saturacao: { type: Number, default: null },
    frequenciaCardiaca: { type: Number, default: null },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const evolutionSchema = new Schema(
  {
    visitaId: {
      type: Schema.Types.ObjectId,
      ref: "Visit",
      required: true,
      unique: true,
      index: true,
    },
    profissionalId: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
      index: true,
    },
    observacoes: { type: String, required: true, trim: true },
    sinaisVitais: { type: vitalSignsSchema, default: {} },
    procedimentosRealizados: { type: String, default: "" },
    intercorrencias: { type: String, default: "" },
    proximaVisitaRecomendada: { type: Date, default: null },
    criadoEm: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

export type EvolutionDocument = HydratedDocument<Evolution>;

export const EvolutionModel = model<Evolution>("Evolution", evolutionSchema);
