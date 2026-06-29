import { UserRole } from "../domain/enums";

export type JwtPayload = {
  userId: string;
  role: UserRole;
  profissionalId?: string;
};

export type LoginInput = {
  email: string;
  senha: string;
};

export type LoginOutput = {
  token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    role: UserRole;
    profissionalId?: string;
  };
};
