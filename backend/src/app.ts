import express from "express";
import { authRoutes } from "./auth/auth.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { patientRoutes } from "./patients/patient.routes";
import { professionalRoutes } from "./professionals/professionals.routes";
import { userRoutes } from "./users/user.routes";
import { visitRoutes } from "./visits/visit.routes";

export const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.get("/", (_req, res) => {
  res.json({ status: "API funcionando" });
});

app.use("/auth", authRoutes);
app.use("/visitas", visitRoutes);
app.use("/profissionais", professionalRoutes);
app.use("/pacientes", patientRoutes);
app.use("/usuarios", userRoutes);

app.use(errorHandler);
