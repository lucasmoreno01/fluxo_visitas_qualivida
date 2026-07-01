import { app } from "./app";
import { connectDatabase } from "./database";
import { setupGraphql } from "./graphql";

const port = Number(process.env.PORT ?? 3000);

connectDatabase()
  .then(async () => {
    await setupGraphql(app);

    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar no Mongo", error);
    process.exit(1);
  });
