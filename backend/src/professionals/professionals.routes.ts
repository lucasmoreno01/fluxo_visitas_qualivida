import { Router } from "express";
import { UserRole } from "../domain/enums";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorizeRole";
import { ProfessionalsController } from "./professionalsController";

export const professionalRoutes = Router();
const professionalsController = new ProfessionalsController();

professionalRoutes.get("/", authenticate, professionalsController.list);

professionalRoutes.get(
  "/:id/agenda",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  professionalsController.getAgenda,
);
