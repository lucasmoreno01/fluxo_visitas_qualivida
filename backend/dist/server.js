"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("./database");
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, database_1.connectDatabase)();
app.get("/", (req, res) => {
    res.json({ status: "API funcionando" });
});
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
//# sourceMappingURL=server.js.map