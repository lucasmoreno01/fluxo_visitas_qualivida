"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalRepository = void 0;
const models_1 = require("../models");
class ProfessionalRepository {
    findById(id) {
        return models_1.ProfessionalModel.findById(id).exec();
    }
    findByUserId(usuarioId) {
        return models_1.ProfessionalModel.findOne({ usuarioId }).exec();
    }
    findActive() {
        return models_1.ProfessionalModel.find({ ativo: true }).sort({ tipo: 1 }).exec();
    }
    create(data) {
        return models_1.ProfessionalModel.create(data);
    }
}
exports.ProfessionalRepository = ProfessionalRepository;
//# sourceMappingURL=ProfessionalRepository.js.map