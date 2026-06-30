import { HydratedDocument, Schema, Types, model } from "mongoose";
import { VisitStatus, VisitType } from "../domain/enums";

export interface VisitHistoryItem {
  statusAnterior: VisitStatus;
  statusNovo: VisitStatus;
  timestamp: Date;
  usuarioId: Types.ObjectId;
}

export interface VisitEntity {
  pacienteId: Types.ObjectId;
  profissionalId: Types.ObjectId;
  tipo: VisitType;
  status: VisitStatus;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  motivoCancelamento?: string | null;
  historico: VisitHistoryItem[];
  criadoEm?: Date;
  atualizadoEm?: Date;
}

const visitHistorySchema = new Schema(
  {
    statusAnterior: {
      type: String,
      enum: Object.values(VisitStatus),
      required: true,
    },
    statusNovo: {
      type: String,
      enum: Object.values(VisitStatus),
      required: true,
    },
    timestamp: { type: Date, default: Date.now, required: true },
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const visitSchema = new Schema(
  {
    pacienteId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    profissionalId: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
      index: true,
    },
    tipo: {
      type: String,
      enum: Object.values(VisitType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(VisitStatus),
      default: VisitStatus.AGENDADA,
      required: true,
      index: true,
    },
    dataHoraInicio: { type: Date, required: true, index: true },
    dataHoraFim: { type: Date, required: true, index: true },
    motivoCancelamento: { type: String, default: null },
    historico: { type: [visitHistorySchema], default: [] },
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
    versionKey: false,
  },
);

visitSchema.index({ profissionalId: 1, dataHoraInicio: 1, dataHoraFim: 1 });
visitSchema.index({ status: 1, dataHoraInicio: 1 });

export type VisitDocument = HydratedDocument<VisitEntity>;

export const VisitModel = model<VisitEntity>("Visit", visitSchema);
