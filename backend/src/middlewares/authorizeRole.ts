import { NextFunction, Request, Response } from "express";
import { UserRole } from "../domain/enums";
import { AppError } from "../errors/AppError";

export function authorizeRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Usuario nao autenticado.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Usuario sem permissao para este recurso.", 403));
    }

    return next();
  };
}
