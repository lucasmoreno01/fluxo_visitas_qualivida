"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientModel = void 0;
const mongoose_1 = require("mongoose");
const patientSchema = new mongoose_1.Schema({
    nome: { type: String, required: true, trim: true },
    telefone: { type: String, required: true, trim: true },
    convenio: { type: String, required: true, trim: true },
    endereco: {
        rua: { type: String, required: true, trim: true },
        bairro: { type: String, required: true, trim: true },
        cidade: { type: String, required: true, trim: true },
        cep: { type: String, required: true, trim: true },
    },
    observacoes: { type: String, default: "" },
    ativo: { type: Boolean, default: true },
}, {
    versionKey: false,
});
patientSchema.index({ nome: 1 });
patientSchema.index({ "endereco.bairro": 1 });
exports.PatientModel = (0, mongoose_1.model)("Patient", patientSchema);
//# sourceMappingURL=Patient.js.map