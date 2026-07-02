import { Types } from "mongoose";
import assert from "node:assert/strict";
import test from "node:test";
import { UserRole, VisitStatus } from "../domain/enums";
import { AppError } from "../errors/AppError";
import { VisitStatusService } from "./VisitStatusService";

function createService(overrides: any = {}) {
  const visitRepository = {
    findById: async () => ({
      id: new Types.ObjectId().toString(),
      status: VisitStatus.AGENDADA,
      profissionalId: new Types.ObjectId(),
    }),
    updateStatus: async () => ({
      id: new Types.ObjectId().toString(),
      status: VisitStatus.CONFIRMADA,
      profissionalId: new Types.ObjectId(),
    }),
    ...overrides.visitRepository,
  };

  const evolutionRepository = {};

  const transactionManager = {
    runInTransaction: async (callback: (session?: unknown) => Promise<any>) =>
      callback(undefined),
    ...overrides.transactionManager,
  };

  const strategyRegistry = {
    get: () => ({
      validate: async () => undefined,
      execute: async () => ({
        id: new Types.ObjectId().toString(),
        status: VisitStatus.CONFIRMADA,
        profissionalId: new Types.ObjectId(),
      }),
    }),
    ...overrides.strategyRegistry,
  };

  return new VisitStatusService(
    visitRepository as any,
    evolutionRepository as any,
    transactionManager as any,
    strategyRegistry as any,
  );
}

test("atualiza o status com sucesso em uma transição válida", async () => {
  const visitId = new Types.ObjectId().toString();
  const professionalId = new Types.ObjectId();
  const actor = {
    usuarioId: new Types.ObjectId().toString(),
    role: UserRole.ADMIN,
  };

  let executed = false;
  const service = createService({
    visitRepository: {
      findById: async () => ({
        id: visitId,
        status: VisitStatus.AGENDADA,
        profissionalId: professionalId,
      }),
      updateStatus: async () => ({
        id: visitId,
        status: VisitStatus.CONFIRMADA,
        profissionalId: professionalId,
      }),
    },
    strategyRegistry: {
      get: () => ({
        from: VisitStatus.AGENDADA,
        to: VisitStatus.CONFIRMADA,
        validate: async () => undefined,
        execute: async () => {
          executed = true;
          return {
            id: visitId,
            status: VisitStatus.CONFIRMADA,
            profissionalId: professionalId,
          };
        },
      }),
    },
  });

  const result = await service.updateStatus(
    visitId,
    { status: VisitStatus.CONFIRMADA },
    actor,
  );

  assert.equal(executed, true);
  assert.equal(result.status, VisitStatus.CONFIRMADA);
});

test("bloqueia profissional que tenta alterar visita de outro profissional", async () => {
  const service = createService({
    visitRepository: {
      findById: async () => ({
        id: new Types.ObjectId().toString(),
        status: VisitStatus.AGENDADA,
        profissionalId: new Types.ObjectId(),
      }),
    },
  });

  await assert.rejects(
    () =>
      service.updateStatus(
        new Types.ObjectId().toString(),
        { status: VisitStatus.EM_ANDAMENTO },
        {
          usuarioId: new Types.ObjectId().toString(),
          role: UserRole.PROFISSIONAL,
          profissionalId: new Types.ObjectId().toString(),
        },
      ),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal((error as AppError).statusCode, 403);
      return true;
    },
  );
});

test("usa transação quando a transição é para concluída", async () => {
  const visitId = new Types.ObjectId().toString();
  const professionalId = new Types.ObjectId();
  let transactionCalled = false;
  let executeCalledWithSession = false;

  const service = createService({
    visitRepository: {
      findById: async () => ({
        id: visitId,
        status: VisitStatus.AGENDADA,
        profissionalId: professionalId,
      }),
      updateStatus: async () => ({
        id: visitId,
        status: VisitStatus.CONCLUIDA,
        profissionalId: professionalId,
      }),
    },
    transactionManager: {
      runInTransaction: async (
        callback: (session?: unknown) => Promise<any>,
      ) => {
        transactionCalled = true;
        return callback({ session: true });
      },
    },
    strategyRegistry: {
      get: () => ({
        from: VisitStatus.AGENDADA,
        to: VisitStatus.CONCLUIDA,
        validate: async () => undefined,
        execute: async (
          _visita: any,
          _payload: any,
          _actor: any,
          context: any,
        ) => {
          executeCalledWithSession = Boolean(context.session);
          return {
            id: visitId,
            status: VisitStatus.CONCLUIDA,
            profissionalId: professionalId,
          };
        },
      }),
    },
  });

  const result = await service.updateStatus(
    visitId,
    { status: VisitStatus.CONCLUIDA },
    {
      usuarioId: new Types.ObjectId().toString(),
      role: UserRole.PROFISSIONAL,
      profissionalId: professionalId.toString(),
    },
  );

  assert.equal(transactionCalled, true);
  assert.equal(executeCalledWithSession, true);
  assert.equal(result.status, VisitStatus.CONCLUIDA);
});
