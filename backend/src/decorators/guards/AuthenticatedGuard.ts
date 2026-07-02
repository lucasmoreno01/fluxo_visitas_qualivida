import { Request } from "express";
import { AppError } from "../../errors/AppError";
import { RouteGuard } from "./RouteGuard";

export class AuthenticatedGuard implements RouteGuard {
  handle(req: Request): void {
    if (!req.user) {
      throw new AppError("Usuario nao autenticado.", 401);
    }
  }
}
