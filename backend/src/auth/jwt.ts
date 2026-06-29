import jwt from "jsonwebtoken";
import { JwtPayload } from "./auth.types";

const JWT_EXPIRES_IN = "8h";

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? "qualivida-dev-secret";
}

export function signAuthToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAuthToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}
