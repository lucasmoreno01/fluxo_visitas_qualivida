import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";


export const professionalRoutes = Router();


professionalRoutes.get(
  "/:id/agenda",
  authenticate,
  professionalController.getAgenda,
);