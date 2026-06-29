"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const models_1 = require("../models");
class UserRepository {
    findByEmail(email) {
        return models_1.UserModel.findOne({ email }).exec();
    }
    findById(id) {
        return models_1.UserModel.findById(id).exec();
    }
    create(data) {
        return models_1.UserModel.create(data);
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map