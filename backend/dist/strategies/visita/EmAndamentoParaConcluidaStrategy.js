"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmAndamentoParaConcluidaStrategy = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../../domain/enums");
const AppError_1 = require("../../errors/AppError");
const helpers_1 = require("./helpers");
class EmAndamentoParaConcluidaStrategy {
    constructor() {
        this.from = enums_1.VisitStatus.EM_ANDAMENTO;
        this.to = enums_1.VisitStatus.CONCLUIDA;
    }
    validate(_visita, payload) {
        if (!payload.evolucao?.observacoes?.trim()) {
            throw new AppError_1.AppError("Evolucao com observacoes e obrigatoria para concluir a visita.", 422);
        }
    }
    async execute(visita, payload, actor, context) {
        if (!payload.evolucao) {
            throw new AppError_1.AppError("Evolucao obrigatoria para concluir a visita.", 422);
        }
        await context.evolutionRepository.create({
            ...payload.evolucao,
            visitaId: new mongoose_1.Types.ObjectId(visita.id),
            profissionalId: new mongoose_1.Types.ObjectId(visita.profissionalId),
        }, context.session);
        const updatedVisit = await context.visitRepository.updateStatus(visita.id, {
            $set: { status: this.to },
            $push: {
                historico: (0, helpers_1.statusHistoryItem)({
                    from: this.from,
                    to: this.to,
                    usuarioId: actor.usuarioId,
                }),
            },
        }, context.session);
        if (!updatedVisit) {
            throw new AppError_1.AppError("Visita nao encontrada para conclusao.", 404);
        }
        return updatedVisit;
    }
}
exports.EmAndamentoParaConcluidaStrategy = EmAndamentoParaConcluidaStrategy;
//# sourceMappingURL=EmAndamentoParaConcluidaStrategy.js.map