import { NextFunction, Request, Response } from "express";

export type RouteHandler = (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export interface RouteGuard {
  handle(req: Request): void;
}
