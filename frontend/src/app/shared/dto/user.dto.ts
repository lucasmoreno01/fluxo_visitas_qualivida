export enum UserRole {
  ADMIN = "ADMIN",
  PROFESSIONAL = "PROFISSIONAL",
}

export interface UserDto {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  profissionalId?: string;
}