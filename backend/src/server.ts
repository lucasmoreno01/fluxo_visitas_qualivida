import { app } from "./app";
import { connectDatabase } from "./database";

const port = Number(process.env.PORT ?? 3000);

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar no Mongo", error);
    process.exit(1);
  });
