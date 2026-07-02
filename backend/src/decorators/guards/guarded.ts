import { NextFunction, Request, RequestHandler, Response } from "express";
import { RouteGuard, RouteHandler } from "./RouteGuard";

export function guarded(...guards: RouteGuard[]) {
  return (handler: RouteHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        guards.forEach((guard) => guard.handle(req));
        await handler(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  };
}
