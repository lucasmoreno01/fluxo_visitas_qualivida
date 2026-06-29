"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../domain/enums");
const userSchema = new mongoose_1.Schema({
    nome: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    senha: { type: String, required: true },
    role: {
        type: String,
        enum: Object.values(enums_1.UserRole),
        required: true,
    },
    ativo: { type: Boolean, default: true },
    criadoEm: { type: Date, default: Date.now },
}, {
    versionKey: false,
});
userSchema.index({ email: 1 }, { unique: true });
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=User.js.map