import { Request } from "express";
import { UserRole } from "../../domain/enums";
import { AppError } from "../../errors/AppError";
import { RouteGuard } from "./RouteGuard";

export class RoleGuard implements RouteGuard {
  constructor(private readonly roles: UserRole[]) {}

  handle(req: Request): void {
    if (!req.user) {
      throw new AppError("Usuario nao autenticado.", 401);
    }

    if (!this.roles.includes(req.user.role)) {
      throw new AppError("Usuario sem permissao para este recurso.", 403);
    }
  }
}
