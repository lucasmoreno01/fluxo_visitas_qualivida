import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { VisitSchedulingService } from "../services";

export class VisitController {
  constructor(
    private readonly visitSchedulingService = new VisitSchedulingService(),
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
}
