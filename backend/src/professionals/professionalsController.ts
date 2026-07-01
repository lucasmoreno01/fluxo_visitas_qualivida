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
  
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const professionals = await this.professionalService.list({
        ativo:
          req.query.ativo !== undefined
            ? req.query.ativo === "true"
            : undefined,
        page: Number(req.query.page ?? 1),
        limit: Number(req.query.limit ?? 10),
      });

      res.json(professionals);
    } catch (error) {
      next(error);
    }
  };
}
