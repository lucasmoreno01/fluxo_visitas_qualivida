import { UserRole } from "../domain/enums";
import { AppError } from "../errors/AppError";
import {
  ProfessionalRepository,
  UserRepository,
} from "../repositories";
import { LoginInput, LoginOutput } from "./auth.types";
import { signAuthToken } from "./jwt";
import { comparePassword } from "./password";

export class AuthService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly professionalRepository = new ProfessionalRepository(),
  ) {}

  async login(input: LoginInput): Promise<LoginOutput> {
    if (!input.email || !input.senha) {
      throw new AppError("Email e senha sao obrigatorios.", 400);
    }

    const user = await this.userRepository.findByEmail(input.email);

    if (!user || !user.ativo) {
      throw new AppError("Credenciais invalidas.", 401);
    }

    const passwordMatches = await comparePassword(input.senha, user.senha);

    if (!passwordMatches) {
      throw new AppError("Credenciais invalidas.", 401);
    }

    const professional =
      user.role === UserRole.PROFISSIONAL
        ? await this.professionalRepository.findByUserId(user.id)
        : null;

    if (user.role === UserRole.PROFISSIONAL && !professional) {
      throw new AppError("Profissional nao encontrado para este usuario.", 403);
    }

    const profissionalId = professional?.id;
    const token = signAuthToken({
      userId: user.id,
      role: user.role,
      profissionalId,
    });

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        profissionalId,
      },
    };
  }
}
