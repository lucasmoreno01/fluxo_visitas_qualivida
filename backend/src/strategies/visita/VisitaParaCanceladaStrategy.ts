import { VisitStatus } from "../../domain/enums";
import { AppError } from "../../errors/AppError";
import { VisitDocument } from "../../models";
import {
  StatusActor,
  StatusPayload,
  VisitStatusStrategy,
  VisitStatusStrategyContext,
} from "./VisitStatusStrategy";
import { statusHistoryItem } from "./helpers";

export class VisitaParaCanceladaStrategy implements VisitStatusStrategy {
  readonly to = VisitStatus.CANCELADA;

  constructor(readonly from: VisitStatus.AGENDADA | VisitStatus.CONFIRMADA) {}

  validate(_visita: VisitDocument, payload: StatusPayload): void {
    if (!payload.motivoCancelamento?.trim()) {
      throw new AppError("Motivo de cancelamento e obrigatorio.", 422);
    }
  }

  async execute(
    visita: VisitDocument,
    payload: StatusPayload,
    actor: StatusActor,
    context: VisitStatusStrategyContext,
  ): Promise<VisitDocument> {
    const updatedVisit = await context.visitRepository.updateStatus(
      visita.id,
      {
        $set: {
          status: this.to,
          motivoCancelamento: payload.motivoCancelamento,
        },
        $push: {
          historico: statusHistoryItem({
            from: this.from,
            to: this.to,
            usuarioId: actor.usuarioId,
          }),
        },
      },
      context.session,
    );

    if (!updatedVisit) {
      throw new AppError("Visita nao encontrada para cancelamento.", 404);
    }

    return updatedVisit;
  }
}
