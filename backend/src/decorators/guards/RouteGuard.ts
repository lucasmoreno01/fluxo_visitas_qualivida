import { NextFunction, Request, Response } from "express";

// `req` usa tipo amplo para aceitar handlers com params tipados nos controllers.
export type RouteHandler = (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export interface RouteGuard {
  handle(req: Request): void;
}
