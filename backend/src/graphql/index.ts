import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServer } from "@apollo/server";
import { Express } from "express";
import { buildGraphqlContext, GraphqlContext } from "./context";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

export async function setupGraphql(app: Express): Promise<void> {
  const server = new ApolloServer<GraphqlContext>({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => buildGraphqlContext(req),
    }),
  );
}
