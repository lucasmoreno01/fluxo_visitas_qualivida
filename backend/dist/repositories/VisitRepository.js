"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitRepository = void 0;
const enums_1 = require("../domain/enums");
const models_1 = require("../models");
class VisitRepository {
    async create(data, session) {
        const [visit] = await models_1.VisitModel.create([data], { session });
        return visit;
    }
    findById(id, session) {
        return models_1.VisitModel.findById(id).session(session ?? null).exec();
    }
    findByIdWithDetails(id) {
        return models_1.VisitModel.findById(id)
            .populate("pacienteId")
            .populate("profissionalId")
            .exec();
    }
    findMany(filters) {
        const query = this.buildListQuery(filters);
        const page = Math.max(filters.page ?? 1, 1);
        const limit = Math.min(Math.max(filters.limit ?? 10, 1), 100);
        return models_1.VisitModel.find(query)
            .sort({ dataHoraInicio: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
    }
    count(filters) {
        return models_1.VisitModel.countDocuments(this.buildListQuery(filters)).exec();
    }
    findAgendaDoDia(profissionalId, data) {
        const { inicio, fim } = this.getDayRange(data);
        return models_1.VisitModel.find({
            profissionalId,
            dataHoraInicio: { $gte: inicio, $lt: fim },
        })
            .sort({ dataHoraInicio: 1 })
            .exec();
    }
    hasOverlappingVisit(params) {
        const query = {
            profissionalId: params.profissionalId,
            status: { $nin: [enums_1.VisitStatus.CANCELADA, enums_1.VisitStatus.CONCLUIDA] },
            dataHoraInicio: { $lt: params.dataHoraFim },
            dataHoraFim: { $gt: params.dataHoraInicio },
        };
        if (params.ignoredVisitId) {
            query._id = { $ne: params.ignoredVisitId };
        }
        return models_1.VisitModel.exists(query).then(Boolean);
    }
    updateStatus(id, update, session) {
        return models_1.VisitModel.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true,
            session,
        }).exec();
    }
    buildListQuery(filters) {
        const query = {};
        if (filters.profissionalId) {
            query.profissionalId = filters.profissionalId;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.data) {
            const { inicio, fim } = this.getDayRange(filters.data);
            query.dataHoraInicio = { $gte: inicio, $lt: fim };
        }
        return query;
    }
    getDayRange(data) {
        const inicio = new Date(data);
        inicio.setHours(0, 0, 0, 0);
        const fim = new Date(inicio);
        fim.setDate(fim.getDate() + 1);
        return { inicio, fim };
    }
}
exports.VisitRepository = VisitRepository;
//# sourceMappingURL=VisitRepository.js.map