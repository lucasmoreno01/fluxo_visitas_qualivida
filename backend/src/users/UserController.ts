import { NextFunction, Request, Response } from "express";
import { hashPassword } from "../auth/password";
import { UserRole } from "../domain/enums";
import { AppError } from "../errors/AppError";
import { ProfessionalModel, UserModel } from "../models";

export class UserController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nome, email, senha, role, ativo, professionalInfo } = req.body;

      if (!nome || !email || !senha || !role) {
        throw new AppError("Campos obrigatorios ausentes.", 400);
      }

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
        if (
          !professionalInfo?.tipo ||
          !professionalInfo?.especialidade ||
          !professionalInfo?.maxVisitasDia
        ) {
          await UserModel.findByIdAndDelete(user._id).exec();
          throw new AppError(
            "Campos do profissional obrigatorios (tipo, especialidade, maxVisitasDia).",
            400,
          );
        }

        await ProfessionalModel.create({
          usuarioId: user._id,
          tipo: professionalInfo.tipo,
          especialidade: professionalInfo.especialidade,
          maxVisitasDia: Number(professionalInfo.maxVisitasDia),
          ativo: user.ativo,
        });
      }

      const userObj = user.toObject();
      delete (userObj as any).senha;

      res.status(201).json(userObj);
    } catch (error) {
      next(error);
    }
  };
}
