"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitModel = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../domain/enums");
const visitHistorySchema = new mongoose_1.Schema({
    statusAnterior: {
        type: String,
        enum: Object.values(enums_1.VisitStatus),
        required: true,
    },
    statusNovo: {
        type: String,
        enum: Object.values(enums_1.VisitStatus),
        required: true,
    },
    timestamp: { type: Date, default: Date.now, required: true },
    usuarioId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    _id: false,
    versionKey: false,
});
const visitSchema = new mongoose_1.Schema({
    pacienteId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
        index: true,
    },
    profissionalId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Professional",
        required: true,
        index: true,
    },
    tipo: {
        type: String,
        enum: Object.values(enums_1.VisitType),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(enums_1.VisitStatus),
        default: enums_1.VisitStatus.AGENDADA,
        required: true,
        index: true,
    },
    dataHoraInicio: { type: Date, required: true, index: true },
    dataHoraFim: { type: Date, required: true, index: true },
    motivoCancelamento: { type: String, default: null },
    historico: { type: [visitHistorySchema], default: [] },
}, {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
    versionKey: false,
});
visitSchema.index({ profissionalId: 1, dataHoraInicio: 1, dataHoraFim: 1 });
visitSchema.index({ status: 1, dataHoraInicio: 1 });
exports.VisitModel = (0, mongoose_1.model)("Visit", visitSchema);
//# sourceMappingURL=Visit.js.map