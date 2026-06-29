import { VisitStatus } from "../../domain/enums";
import { AppError } from "../../errors/AppError";
import { VisitStatusStrategy } from "./VisitStatusStrategy";

export class VisitStatusStrategyRegistry {
  private readonly strategies = new Map<
    VisitStatus,
    Map<VisitStatus, VisitStatusStrategy>
  >();

  constructor(strategies: VisitStatusStrategy[]) {
    strategies.forEach((strategy) => this.register(strategy));
  }

  get(from: VisitStatus, to: VisitStatus): VisitStatusStrategy {
    const strategy = this.strategies.get(from)?.get(to);

    if (!strategy) {
      throw new AppError(
        `Transicao invalida de ${from} para ${to}.`,
        422,
      );
    }

    return strategy;
  }

  private register(strategy: VisitStatusStrategy): void {
    const fromStrategies = this.strategies.get(strategy.from) ?? new Map();
    fromStrategies.set(strategy.to, strategy);
    this.strategies.set(strategy.from, fromStrategies);
  }
}
