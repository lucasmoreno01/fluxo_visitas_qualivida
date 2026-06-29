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

export class ConfirmadaParaEmAndamentoStrategy implements VisitStatusStrategy {
  readonly from = VisitStatus.CONFIRMADA;
  readonly to = VisitStatus.EM_ANDAMENTO;

  validate(): void {
    return;
  }

  async execute(
    visita: VisitDocument,
    _payload: StatusPayload,
    actor: StatusActor,
    context: VisitStatusStrategyContext,
  ): Promise<VisitDocument> {
    const updatedVisit = await context.visitRepository.updateStatus(
      visita.id,
      {
        $set: { status: this.to },
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
      throw new AppError("Visita nao encontrada para iniciar atendimento.", 404);
    }

    return updatedVisit;
  }
}
