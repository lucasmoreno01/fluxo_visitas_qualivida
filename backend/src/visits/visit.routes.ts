import { Router } from "express";
import { UserRole } from "../domain/enums";
import {
  guarded,
  JwtAuthGuard,
  RoleGuard,
} from "../decorators/guards";
import { VisitController } from "./VisitController";

const visitController = new VisitController();
const jwtAuth = new JwtAuthGuard();
const adminOnly = new RoleGuard([UserRole.ADMIN]);

export const visitRoutes = Router();

visitRoutes.post(
  "/",
  guarded(jwtAuth, adminOnly)(visitController.schedule),
);

visitRoutes.get("/", guarded(jwtAuth)(visitController.list));

visitRoutes.get("/:id", guarded(jwtAuth)(visitController.findById));

visitRoutes.patch(
  "/:id/status",
  guarded(jwtAuth)(visitController.updateStatus),
);
