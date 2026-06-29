import { ClientSession, Types } from "mongoose";
import { Evolution, EvolutionDocument, EvolutionModel } from "../models";

export class EvolutionRepository {
  findByVisitId(visitaId: string | Types.ObjectId): Promise<EvolutionDocument | null> {
    return EvolutionModel.findOne({ visitaId }).exec();
  }

  async create(
    data: Evolution,
    session?: ClientSession,
  ): Promise<EvolutionDocument> {
    const [evolution] = await EvolutionModel.create([data], { session });
    return evolution;
  }
}
