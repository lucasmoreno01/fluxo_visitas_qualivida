import { Request } from "express";
import { verifyAuthToken } from "../../auth/jwt";
import { AppError } from "../../errors/AppError";
import { RouteGuard } from "./RouteGuard";

export class JwtAuthGuard implements RouteGuard {
  handle(req: Request): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Token de autenticacao nao informado.", 401);
    }

    try {
      req.user = verifyAuthToken(authHeader.replace("Bearer ", ""));
    } catch (_error) {
      throw new AppError("Token de autenticacao invalido.", 401);
    }
  }
}
