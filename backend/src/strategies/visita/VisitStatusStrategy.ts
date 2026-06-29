import { ClientSession, Types } from "mongoose";
import { VisitStatus } from "../../domain/enums";
import { Evolution, VisitDocument } from "../../models";
import { EvolutionRepository, VisitRepository } from "../../repositories";

export type EvolutionInput = Pick<
  Evolution,
  | "observacoes"
  | "sinaisVitais"
  | "procedimentosRealizados"
  | "intercorrencias"
  | "proximaVisitaRecomendada"
>;

export type StatusPayload = {
  status: VisitStatus;
  motivoCancelamento?: string;
  evolucao?: EvolutionInput;
};

export type StatusActor = {
  usuarioId: string | Types.ObjectId;
  profissionalId?: string | Types.ObjectId;
};

export type VisitStatusStrategyContext = {
  visitRepository: VisitRepository;
  evolutionRepository: EvolutionRepository;
  session?: ClientSession;
};

export interface VisitStatusStrategy {
  readonly from: VisitStatus;
  readonly to: VisitStatus;
  validate(visita: VisitDocument, payload: StatusPayload): void | Promise<void>;
  execute(
    visita: VisitDocument,
    payload: StatusPayload,
    actor: StatusActor,
    context: VisitStatusStrategyContext,
  ): Promise<VisitDocument>;
}
