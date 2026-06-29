import { Router } from "express";
import { AuthController } from "./auth.controller";

const authController = new AuthController();

export const authRoutes = Router();

authRoutes.post("/login", authController.login);
