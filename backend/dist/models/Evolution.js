"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionModel = void 0;
const mongoose_1 = require("mongoose");
const vitalSignsSchema = new mongoose_1.Schema({
    pressao: { type: String, default: "" },
    temperatura: { type: Number, default: null },
    saturacao: { type: Number, default: null },
    frequenciaCardiaca: { type: Number, default: null },
}, {
    _id: false,
    versionKey: false,
});
const evolutionSchema = new mongoose_1.Schema({
    visitaId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Visit",
        required: true,
        unique: true,
        index: true,
    },
    profissionalId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Professional",
        required: true,
        index: true,
    },
    observacoes: { type: String, required: true, trim: true },
    sinaisVitais: { type: vitalSignsSchema, default: {} },
    procedimentosRealizados: { type: String, default: "" },
    intercorrencias: { type: String, default: "" },
    proximaVisitaRecomendada: { type: Date, default: null },
    criadoEm: { type: Date, default: Date.now },
}, {
    versionKey: false,
});
exports.EvolutionModel = (0, mongoose_1.model)("Evolution", evolutionSchema);
//# sourceMappingURL=Evolution.js.map