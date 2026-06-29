"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusHistoryItem = statusHistoryItem;
const mongoose_1 = require("mongoose");
function statusHistoryItem(params) {
    return {
        statusAnterior: params.from,
        statusNovo: params.to,
        timestamp: new Date(),
        usuarioId: new mongoose_1.Types.ObjectId(params.usuarioId),
    };
}
//# sourceMappingURL=helpers.js.map