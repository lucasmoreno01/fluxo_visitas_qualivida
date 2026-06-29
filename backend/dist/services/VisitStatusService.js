"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitStatusService = void 0;
const enums_1 = require("../domain/enums");
const AppError_1 = require("../errors/AppError");
const repositories_1 = require("../repositories");
const visita_1 = require("../strategies/visita");
const allowedTransitionsByRole = new Map([
    [enums_1.UserRole.ADMIN, [enums_1.VisitStatus.CONFIRMADA, enums_1.VisitStatus.CANCELADA]],
    [enums_1.UserRole.PROFISSIONAL, [enums_1.VisitStatus.EM_ANDAMENTO, enums_1.VisitStatus.CONCLUIDA]],
]);
class VisitStatusService {
    constructor(visitRepository = new repositories_1.VisitRepository(), evolutionRepository = new repositories_1.EvolutionRepository(), transactionManager = new repositories_1.TransactionManager(), strategyRegistry = visita_1.visitStatusStrategyRegistry) {
        this.visitRepository = visitRepository;
        this.evolutionRepository = evolutionRepository;
        this.transactionManager = transactionManager;
        this.strategyRegistry = strategyRegistry;
    }
    async updateStatus(id, payload, actor) {
        const visita = await this.visitRepository.findById(id);
        if (!visita) {
            throw new AppError_1.AppError("Visita nao encontrada.", 404);
        }
        this.authorize(visita.profissionalId.toString(), payload.status, actor);
        const strategy = this.strategyRegistry.get(visita.status, payload.status);
        await strategy.validate(visita, payload);
        if (strategy.to !== enums_1.VisitStatus.CONCLUIDA) {
            return strategy.execute(visita, payload, actor, {
                visitRepository: this.visitRepository,
                evolutionRepository: this.evolutionRepository,
            });
        }
        return this.transactionManager.runInTransaction(async (session) => {
            const freshVisit = await this.visitRepository.findById(id, session);
            if (!freshVisit) {
                throw new AppError_1.AppError("Visita nao encontrada.", 404);
            }
            const freshStrategy = this.strategyRegistry.get(freshVisit.status, payload.status);
            await freshStrategy.validate(freshVisit, payload);
            return freshStrategy.execute(freshVisit, payload, actor, {
                visitRepository: this.visitRepository,
                evolutionRepository: this.evolutionRepository,
                session,
            });
        });
    }
    authorize(visitProfessionalId, targetStatus, actor) {
        const allowedStatuses = allowedTransitionsByRole.get(actor.role) ?? [];
        if (!allowedStatuses.includes(targetStatus)) {
            throw new AppError_1.AppError("Usuario sem permissao para esta transicao.", 403);
        }
        if (actor.role === enums_1.UserRole.PROFISSIONAL &&
            actor.profissionalId !== visitProfessionalId) {
            throw new AppError_1.AppError("Profissional nao pode alterar visita de outro profissional.", 403);
        }
    }
}
exports.VisitStatusService = VisitStatusService;
//# sourceMappingURL=VisitStatusService.js.map