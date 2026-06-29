import express from "express";
import { authRoutes } from "./auth/auth.routes";
import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "API funcionando" });
});

app.use("/auth", authRoutes);

app.use(errorHandler);
