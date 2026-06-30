import { Router } from "express";
import { UserRole } from "../domain/enums";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorizeRole";
import { VisitController } from "./VisitController";

const visitController = new VisitController();

export const visitRoutes = Router();

visitRoutes.post(
  "/",
  authenticate,
  authorizeRole(UserRole.ADMIN),
  visitController.schedule,
);

visitRoutes.get("/", authenticate, visitController.list);

visitRoutes.get("/:id", authenticate, visitController.findById);

visitRoutes.patch(
  "/:id/status",
  authenticate,
  visitController.updateStatus,
);
