import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { verifyAuthToken } from "../auth/jwt";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Token de autenticacao nao informado.", 401));
  }

  try {
    req.user = verifyAuthToken(authHeader.replace("Bearer ", ""));
    return next();
  } catch (_error) {
    return next(new AppError("Token de autenticacao invalido.", 401));
  }
}
