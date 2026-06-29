import { Types } from "mongoose";
import { VisitStatus } from "../../domain/enums";

export function statusHistoryItem(params: {
  from: VisitStatus;
  to: VisitStatus;
  usuarioId: string | Types.ObjectId;
}) {
  return {
    statusAnterior: params.from,
    statusNovo: params.to,
    timestamp: new Date(),
    usuarioId: new Types.ObjectId(params.usuarioId),
  };
}
