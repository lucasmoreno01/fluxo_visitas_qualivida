"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalModel = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../domain/enums");
const professionalSchema = new mongoose_1.Schema({
    usuarioId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    tipo: {
        type: String,
        enum: Object.values(enums_1.ProfessionalType),
        required: true,
    },
    especialidade: { type: String, required: true, trim: true },
    ativo: { type: Boolean, default: true },
    maxVisitasDia: { type: Number, required: true, min: 1 },
}, {
    versionKey: false,
});
professionalSchema.index({ usuarioId: 1 }, { unique: true });
exports.ProfessionalModel = (0, mongoose_1.model)("Professional", professionalSchema);
//# sourceMappingURL=Professional.js.map