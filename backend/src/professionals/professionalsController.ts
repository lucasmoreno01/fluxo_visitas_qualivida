import { NextFunction, Request, Response } from "express";
import { ProfessionalsService } from "../services/professionalsService";

export class ProfessionalsController {
  constructor(
    private readonly professionalService = new ProfessionalsService(),
  ) {}
  getAgenda = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const agenda = await this.professionalService.getAgenda(
        req.params.id,
        req.query.data as string | undefined,
      );

      res.json(agenda);
    } catch (error) {
      next(error);
    }
  };
}
