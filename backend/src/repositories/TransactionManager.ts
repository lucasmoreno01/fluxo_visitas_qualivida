import mongoose from "mongoose";

export class TransactionManager {
  async runInTransaction<T>(operation: Parameters<typeof mongoose.connection.transaction<T>>[0]): Promise<T> {
    return mongoose.connection.transaction(operation);
  }
}
