import { Router } from "express";
import { UserRole } from "../domain/enums";
import {
  guarded,
  JwtAuthGuard,
  RoleGuard,
} from "../decorators/guards";
import { ProfessionalsController } from "./professionalsController";

export const professionalRoutes = Router();
const professionalsController = new ProfessionalsController();
const jwtAuth = new JwtAuthGuard();
const adminOnly = new RoleGuard([UserRole.ADMIN]);

professionalRoutes.get("/", guarded(jwtAuth)(professionalsController.list));

professionalRoutes.get(
  "/:id/agenda",
  guarded(jwtAuth, adminOnly)(professionalsController.getAgenda),
);
