"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitStatusStrategyRegistry = void 0;
const AppError_1 = require("../../errors/AppError");
class VisitStatusStrategyRegistry {
    constructor(strategies) {
        this.strategies = new Map();
        strategies.forEach((strategy) => this.register(strategy));
    }
    get(from, to) {
        const strategy = this.strategies.get(from)?.get(to);
        if (!strategy) {
            throw new AppError_1.AppError(`Transicao invalida de ${from} para ${to}.`, 422);
        }
        return strategy;
    }
    register(strategy) {
        const fromStrategies = this.strategies.get(strategy.from) ?? new Map();
        fromStrategies.set(strategy.to, strategy);
        this.strategies.set(strategy.from, fromStrategies);
    }
}
exports.VisitStatusStrategyRegistry = VisitStatusStrategyRegistry;
//# sourceMappingURL=VisitStatusStrategyRegistry.js.map