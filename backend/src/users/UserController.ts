import { Request, Response, NextFunction } from "express";
import { UserModel, ProfessionalModel } from "../models";
import { hashPassword } from "../auth/password";
import { AppError } from "../errors/AppError";
import { UserRole } from "../domain/enums";

export class UserController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nome, email, senha, role, ativo, professionalInfo } = req.body;

      if (!nome || !email || !senha || !role) {
        throw new AppError("Campos obrigatorios ausentes.", 400);
      }

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email }).exec();
      if (existingUser) {
        throw new AppError("Email ja cadastrado.", 400);
      }

      const hashedPassword = await hashPassword(senha);

      const user = await UserModel.create({
        nome,
        email,
        senha: hashedPassword,
        role,
        ativo: ativo !== undefined ? ativo : true,
      });

      if (role === UserRole.PROFISSIONAL) {
        if (!professionalInfo?.tipo || !professionalInfo?.especialidade || !professionalInfo?.maxVisitasDia) {
          // Clean up created user to keep operation atomic
          await UserModel.findByIdAndDelete(user._id).exec();
          throw new AppError("Campos do profissional obrigatorios (tipo, especialidade, maxVisitasDia).", 400);
        }

        await ProfessionalModel.create({
          usuarioId: user._id,
          tipo: professionalInfo.tipo,
          especialidade: professionalInfo.especialidade,
          maxVisitasDia: Number(professionalInfo.maxVisitasDia),
          ativo: user.ativo,
        });
      }

      // Hide password in response
      const userObj = user.toObject();
      delete (userObj as any).senha;

      res.status(201).json(userObj);
    } catch (error) {
      next(error);
    }
  };
}
