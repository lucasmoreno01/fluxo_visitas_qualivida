import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorizeRole";
import { UserRole } from "../domain/enums";
import { PatientController } from "./PatientController";

export const patientRoutes = Router();
const patientController = new PatientController();

patientRoutes.get("/", authenticate, patientController.list);
patientRoutes.post("/", authenticate, authorizeRole(UserRole.ADMIN), patientController.create);
patientRoutes.patch("/:id", authenticate, authorizeRole(UserRole.ADMIN), patientController.update);
