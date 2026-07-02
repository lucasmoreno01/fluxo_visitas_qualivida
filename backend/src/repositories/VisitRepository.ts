import { ClientSession, QueryFilter, Types, UpdateQuery } from "mongoose";
import { VisitStatus } from "../domain/enums";
import { VisitDocument, VisitEntity, VisitModel } from "../models";

export type VisitListFilters = {
  data?: Date;
  profissionalId?: string | Types.ObjectId;
  status?: VisitStatus;
  page?: number;
  limit?: number;
};

type VisitOverlapParams = {
  profissionalId: Types.ObjectId | string;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  ignoredVisitId?: Types.ObjectId | string;
};

type PatientOverlapParams = {
  pacienteId: Types.ObjectId | string;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  ignoredVisitId?: Types.ObjectId | string;
};

export class VisitRepository {
  async create(
    data: VisitEntity,
    session?: ClientSession,
  ): Promise<VisitDocument> {
    const [visit] = await VisitModel.create([data], { session });
    return visit;
  }

  findById(
    id: string | Types.ObjectId,
    session?: ClientSession,
  ): Promise<VisitDocument | null> {
    return VisitModel.findById(id)
      .session(session ?? null)
      .exec();
  }

  findByIdWithDetails(
    id: string | Types.ObjectId,
  ): Promise<VisitDocument | null> {
    return VisitModel.findById(id)
      .populate("pacienteId")
      .populate("profissionalId")
      .exec();
  }

  findMany(filters: VisitListFilters): Promise<VisitDocument[]> {
    const query = this.buildListQuery(filters);
    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(Math.max(filters.limit ?? 10, 1), 100);

    return VisitModel.find(query)
      .sort({ dataHoraInicio: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  count(filters: VisitListFilters): Promise<number> {
    return VisitModel.countDocuments(this.buildListQuery(filters)).exec();
  }

  findAgendaDoDia(
    profissionalId: string | Types.ObjectId,
    data: Date,
  ): Promise<VisitDocument[]> {
    const { inicio, fim } = this.getDayRange(data);

    return VisitModel.find({
      profissionalId,
      dataHoraInicio: { $gte: inicio, $lt: fim },
    })
      .sort({ dataHoraInicio: 1 })
      .exec();
  }

  hasOverlappingVisit(params: VisitOverlapParams): Promise<boolean> {
    const query: QueryFilter<VisitEntity> = {
      profissionalId: params.profissionalId,
      status: { $nin: [VisitStatus.CANCELADA, VisitStatus.CONCLUIDA] },
      dataHoraInicio: { $lt: params.dataHoraFim },
      dataHoraFim: { $gt: params.dataHoraInicio },
    };

    if (params.ignoredVisitId) {
      query._id = { $ne: params.ignoredVisitId };
    }

    return VisitModel.exists(query).then(Boolean);
  }

  hasPatientOverlappingVisit(params: PatientOverlapParams): Promise<boolean> {
    const query: QueryFilter<VisitEntity> = {
      pacienteId: params.pacienteId,
      status: { $nin: [VisitStatus.CANCELADA, VisitStatus.CONCLUIDA] },
      dataHoraInicio: { $lt: params.dataHoraFim },
      dataHoraFim: { $gt: params.dataHoraInicio },
    };

    if (params.ignoredVisitId) {
      query._id = { $ne: params.ignoredVisitId };
    }

    return VisitModel.exists(query).then(Boolean);
  }

  countActiveVisitsOnDay(
    profissionalId: string | Types.ObjectId,
    data: Date,
  ): Promise<number> {
    const { inicio, fim } = this.getDayRange(data);

    return VisitModel.countDocuments({
      profissionalId,
      status: { $ne: VisitStatus.CANCELADA },
      dataHoraInicio: { $gte: inicio, $lt: fim },
    }).exec();
  }

  updateStatus(
    id: string | Types.ObjectId,
    update: UpdateQuery<VisitEntity>,
    session?: ClientSession,
  ): Promise<VisitDocument | null> {
    return VisitModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      session,
    }).exec();
  }

  private buildListQuery(filters: VisitListFilters): QueryFilter<VisitEntity> {
    const query: QueryFilter<VisitEntity> = {};

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

  private getDayRange(data: Date): { inicio: Date; fim: Date } {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);

    return { inicio, fim };
  }
}
