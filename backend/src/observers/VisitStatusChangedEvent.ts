import { VisitStatus } from "../domain/enums";

export type VisitStatusChangedEvent = {
  visitId: string;
  pacienteId: string;
  profissionalId: string;
  statusAnterior: VisitStatus;
  statusNovo: VisitStatus;
  usuarioId: string;
  timestamp: Date;
};
