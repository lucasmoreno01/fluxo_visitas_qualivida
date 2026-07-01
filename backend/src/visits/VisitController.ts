import { NextFunction, Request, Response } from "express";
import { VisitStatus } from "../domain/enums";
import { AppError } from "../errors/AppError";
import { VisitQueryService } from "../services/VisitQueryService";
import { VisitSchedulingService } from "../services/VisitSchedulingService";
import { VisitStatusService } from "../services/VisitStatusService";
type VisitParams = {
  id: string;
};
export class VisitController {
  constructor(
    private readonly visitSchedulingService = new VisitSchedulingService(),
    private readonly visitQueryService = new VisitQueryService(),
    private readonly visitStatusService = new VisitStatusService(),
  ) {}

  schedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError("Usuario nao autenticado.", 401);
      }

      const visit = await this.visitSchedulingService.scheduleVisit(req.body, {
        usuarioId: req.user.userId,
        role: req.user.role,
      });

      res.status(201).json(visit);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const visits = await this.visitQueryService.listVisits({
        profissionalId: req.query.profissionalId as string | undefined,
        status: req.query.status as VisitStatus | undefined,
        data: req.query.data ? new Date(req.query.data as string) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      });

      res.json(visits);
    } catch (error) {
      next(error);
    }
  };

  findById = async (
    req: Request<VisitParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const visit = await this.visitQueryService.findById(req.params.id);

      res.json(visit);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Usuario nao autenticado.", 401);
      }

      const visit = await this.visitStatusService.updateStatus(
        req.params.id,
        req.body,
        {
          usuarioId: req.user.userId,
          role: req.user.role,
          profissionalId: req.user.profissionalId,
        },
      );

      res.json(visit);
    } catch (error) {
      next(error);
    }
  };
}
