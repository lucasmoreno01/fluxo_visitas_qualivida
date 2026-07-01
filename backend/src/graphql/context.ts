import { Request } from "express";
import { GraphQLError } from "graphql";
import { JwtPayload } from "../auth/auth.types";
import { verifyAuthToken } from "../auth/jwt";

export type GraphqlContext = {
  user?: JwtPayload;
};

export function buildGraphqlContext(req: Request): GraphqlContext {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return {};
  }

  try {
    return {
      user: verifyAuthToken(authHeader.replace("Bearer ", "")),
    };
  } catch (_error) {
    throw new GraphQLError("Token de autenticacao invalido.", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }
}
