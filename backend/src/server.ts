import express from "express";
import { connectDatabase } from "./database";

const app = express();

app.use(express.json());

connectDatabase();

app.get("/", (req, res) => {
  res.json({ status: "API funcionando" });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});