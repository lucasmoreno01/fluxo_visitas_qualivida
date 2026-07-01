import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { ProfessionalsController } from "./professionalsController";

export const professionalRoutes = Router();
const professionalsController = new ProfessionalsController();

professionalRoutes.get("/", authenticate, professionalsController.list);

professionalRoutes.get(
  "/:id/agenda",
  authenticate,
  professionalsController.getAgenda,
);
