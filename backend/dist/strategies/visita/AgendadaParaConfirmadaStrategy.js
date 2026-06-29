"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendadaParaConfirmadaStrategy = void 0;
const enums_1 = require("../../domain/enums");
const AppError_1 = require("../../errors/AppError");
const helpers_1 = require("./helpers");
class AgendadaParaConfirmadaStrategy {
    constructor() {
        this.from = enums_1.VisitStatus.AGENDADA;
        this.to = enums_1.VisitStatus.CONFIRMADA;
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
            throw new AppError_1.AppError("Visita nao encontrada para confirmacao.", 404);
        }
        return updatedVisit;
    }
}
exports.AgendadaParaConfirmadaStrategy = AgendadaParaConfirmadaStrategy;
//# sourceMappingURL=AgendadaParaConfirmadaStrategy.js.map