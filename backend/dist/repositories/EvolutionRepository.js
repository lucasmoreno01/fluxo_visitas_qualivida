"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionRepository = void 0;
const models_1 = require("../models");
class EvolutionRepository {
    findByVisitId(visitaId) {
        return models_1.EvolutionModel.findOne({ visitaId }).exec();
    }
    async create(data, session) {
        const [evolution] = await models_1.EvolutionModel.create([data], { session });
        return evolution;
    }
}
exports.EvolutionRepository = EvolutionRepository;
//# sourceMappingURL=EvolutionRepository.js.map