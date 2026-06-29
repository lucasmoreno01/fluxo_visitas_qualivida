import { VisitStatus } from "../../domain/enums";
import { AgendadaParaConfirmadaStrategy } from "./AgendadaParaConfirmadaStrategy";
import { ConfirmadaParaEmAndamentoStrategy } from "./ConfirmadaParaEmAndamentoStrategy";
import { EmAndamentoParaConcluidaStrategy } from "./EmAndamentoParaConcluidaStrategy";
import { VisitaParaCanceladaStrategy } from "./VisitaParaCanceladaStrategy";
import { VisitStatusStrategyRegistry } from "./VisitStatusStrategyRegistry";

export * from "./VisitStatusStrategy";
export * from "./VisitStatusStrategyRegistry";

export const visitStatusStrategyRegistry = new VisitStatusStrategyRegistry([
  new AgendadaParaConfirmadaStrategy(),
  new ConfirmadaParaEmAndamentoStrategy(),
  new EmAndamentoParaConcluidaStrategy(),
  new VisitaParaCanceladaStrategy(VisitStatus.AGENDADA),
  new VisitaParaCanceladaStrategy(VisitStatus.CONFIRMADA),
]);
