"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDatabase() {
    await mongoose_1.default.connect(process.env.MONGO_URL);
    console.log("Mongo conectado");
}
//# sourceMappingURL=index.js.map