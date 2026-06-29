import { Types } from "mongoose";
import { User, UserDocument, UserModel } from "../models";

export class UserRepository {
  findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).exec();
  }

  findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  }

  create(data: User): Promise<UserDocument> {
    return UserModel.create(data);
  }
}
