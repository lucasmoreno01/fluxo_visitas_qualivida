"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitStatusStrategyRegistry = void 0;
const enums_1 = require("../../domain/enums");
const AgendadaParaConfirmadaStrategy_1 = require("./AgendadaParaConfirmadaStrategy");
const ConfirmadaParaEmAndamentoStrategy_1 = require("./ConfirmadaParaEmAndamentoStrategy");
const EmAndamentoParaConcluidaStrategy_1 = require("./EmAndamentoParaConcluidaStrategy");
const VisitaParaCanceladaStrategy_1 = require("./VisitaParaCanceladaStrategy");
const VisitStatusStrategyRegistry_1 = require("./VisitStatusStrategyRegistry");
__exportStar(require("./VisitStatusStrategy"), exports);
__exportStar(require("./VisitStatusStrategyRegistry"), exports);
exports.visitStatusStrategyRegistry = new VisitStatusStrategyRegistry_1.VisitStatusStrategyRegistry([
    new AgendadaParaConfirmadaStrategy_1.AgendadaParaConfirmadaStrategy(),
    new ConfirmadaParaEmAndamentoStrategy_1.ConfirmadaParaEmAndamentoStrategy(),
    new EmAndamentoParaConcluidaStrategy_1.EmAndamentoParaConcluidaStrategy(),
    new VisitaParaCanceladaStrategy_1.VisitaParaCanceladaStrategy(enums_1.VisitStatus.AGENDADA),
    new VisitaParaCanceladaStrategy_1.VisitaParaCanceladaStrategy(enums_1.VisitStatus.CONFIRMADA),
]);
//# sourceMappingURL=index.js.map