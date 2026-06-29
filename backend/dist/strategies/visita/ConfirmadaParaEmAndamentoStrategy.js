"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmadaParaEmAndamentoStrategy = void 0;
const enums_1 = require("../../domain/enums");
const AppError_1 = require("../../errors/AppError");
const helpers_1 = require("./helpers");
class ConfirmadaParaEmAndamentoStrategy {
    constructor() {
        this.from = enums_1.VisitStatus.CONFIRMADA;
        this.to = enums_1.VisitStatus.EM_ANDAMENTO;
    }
    validate() {
        return;
    }
    async execute(visita, _payload, actor, context) {
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
            throw new AppError_1.AppError("Visita nao encontrada para iniciar atendimento.", 404);
        }
        return updatedVisit;
    }
}
exports.ConfirmadaParaEmAndamentoStrategy = ConfirmadaParaEmAndamentoStrategy;
//# sourceMappingURL=ConfirmadaParaEmAndamentoStrategy.js.map