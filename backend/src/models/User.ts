import { Schema, model, HydratedDocument } from "mongoose";
import { UserRole } from "../domain/enums";

export interface User {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  ativo: boolean;
  criadoEm: Date;
}

const userSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    senha: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    ativo: { type: Boolean, default: true },
    criadoEm: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

userSchema.index({ email: 1 }, { unique: true });

export type UserDocument = HydratedDocument<User>;

export const UserModel = model<User>("User", userSchema);
