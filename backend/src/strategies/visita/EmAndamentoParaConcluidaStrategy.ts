import { Types } from "mongoose";
import { VisitStatus } from "../../domain/enums";
import { AppError } from "../../errors/AppError";
import { Evolution, VisitDocument } from "../../models";
import {
  StatusActor,
  StatusPayload,
  VisitStatusStrategy,
  VisitStatusStrategyContext,
} from "./VisitStatusStrategy";
import { statusHistoryItem } from "./helpers";

export class EmAndamentoParaConcluidaStrategy implements VisitStatusStrategy {
  readonly from = VisitStatus.EM_ANDAMENTO;
  readonly to = VisitStatus.CONCLUIDA;

  validate(_visita: VisitDocument, payload: StatusPayload): void {
    if (!payload.evolucao?.observacoes?.trim()) {
      throw new AppError(
        "Evolucao com observacoes e obrigatoria para concluir a visita.",
        422,
      );
    }
  }

  async execute(
    visita: VisitDocument,
    payload: StatusPayload,
    actor: StatusActor,
    context: VisitStatusStrategyContext,
  ): Promise<VisitDocument> {
    if (!payload.evolucao) {
      throw new AppError("Evolucao obrigatoria para concluir a visita.", 422);
    }

    await context.evolutionRepository.create(
      {
        ...payload.evolucao,
        visitaId: new Types.ObjectId(visita.id),
        profissionalId: new Types.ObjectId(visita.profissionalId),
      } as Evolution,
      context.session,
    );

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
      throw new AppError("Visita nao encontrada para conclusao.", 404);
    }

    return updatedVisit;
  }
}
