"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientRepository = void 0;
const models_1 = require("../models");
class PatientRepository {
    findById(id) {
        return models_1.PatientModel.findById(id).exec();
    }
    findActive() {
        return models_1.PatientModel.find({ ativo: true }).sort({ nome: 1 }).exec();
    }
    create(data) {
        return models_1.PatientModel.create(data);
    }
}
exports.PatientRepository = PatientRepository;
//# sourceMappingURL=PatientRepository.js.map