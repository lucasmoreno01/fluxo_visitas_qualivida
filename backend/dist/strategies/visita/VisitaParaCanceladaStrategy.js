"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitaParaCanceladaStrategy = void 0;
const enums_1 = require("../../domain/enums");
const AppError_1 = require("../../errors/AppError");
const helpers_1 = require("./helpers");
class VisitaParaCanceladaStrategy {
    constructor(from) {
        this.from = from;
        this.to = enums_1.VisitStatus.CANCELADA;
    }
    validate(_visita, payload) {
        if (!payload.motivoCancelamento?.trim()) {
            throw new AppError_1.AppError("Motivo de cancelamento e obrigatorio.", 422);
        }
    }
    async execute(visita, payload, actor, context) {
        const updatedVisit = await context.visitRepository.updateStatus(visita.id, {
            $set: {
                status: this.to,
                motivoCancelamento: payload.motivoCancelamento,
            },
            $push: {
                historico: (0, helpers_1.statusHistoryItem)({
                    from: this.from,
                    to: this.to,
                    usuarioId: actor.usuarioId,
                }),
            },
        }, context.session);
        if (!updatedVisit) {
            throw new AppError_1.AppError("Visita nao encontrada para cancelamento.", 404);
        }
        return updatedVisit;
    }
}
exports.VisitaParaCanceladaStrategy = VisitaParaCanceladaStrategy;
//# sourceMappingURL=VisitaParaCanceladaStrategy.js.map