import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorizeRole";
import { UserRole } from "../domain/enums";
import { UserController } from "./UserController";

export const userRoutes = Router();
const userController = new UserController();

userRoutes.post("/", authenticate, authorizeRole(UserRole.ADMIN), userController.create);
