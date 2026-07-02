import { Types } from "mongoose";
import assert from "node:assert/strict";
import test from "node:test";
import { UserRole, VisitStatus, VisitType } from "../domain/enums";
import { AppError } from "../errors/AppError";
import { VisitSchedulingService } from "./VisitSchedulingService";

type RepositoryOverrides = {
  visitRepository?: Partial<{
    create: (visit: any) => Promise<any>;
    hasOverlappingVisit: (params: any) => Promise<boolean>;
  }>;
  patientRepository?: Partial<{
    findById: (id: Types.ObjectId | string) => Promise<any>;
  }>;
  professionalRepository?: Partial<{
    findById: (id: Types.ObjectId | string) => Promise<any>;
  }>;
};

function createService(overrides: RepositoryOverrides = {}) {
  const visitRepository = {
    create: async (visit: any) => ({ ...visit, _id: new Types.ObjectId() }),
    hasOverlappingVisit: async () => false,
    ...overrides.visitRepository,
  };

  const patientRepository = {
    findById: async () => ({ _id: new Types.ObjectId(), ativo: true }),
    ...overrides.patientRepository,
  };

  const professionalRepository = {
    findById: async () => ({ _id: new Types.ObjectId(), ativo: true }),
    ...overrides.professionalRepository,
  };

  return new VisitSchedulingService(
    visitRepository as any,
    patientRepository as any,
    professionalRepository as any,
  );
}

test("agenda uma visita com sucesso quando o usuário é admin e os dados são válidos", async () => {
  const pacienteId = new Types.ObjectId().toString();
  const profissionalId = new Types.ObjectId().toString();
  const actor = {
    usuarioId: new Types.ObjectId().toString(),
    role: UserRole.ADMIN,
  };

  let createdVisitPayload: any;
  const service = createService({
    visitRepository: {
      create: async (visit: any) => {
        createdVisitPayload = visit;
        return { ...visit, _id: new Types.ObjectId() };
      },
      hasOverlappingVisit: async () => false,
    },
    patientRepository: {
      findById: async () => ({
        _id: new Types.ObjectId(pacienteId),
        ativo: true,
      }),
    },
    professionalRepository: {
      findById: async () => ({
        _id: new Types.ObjectId(profissionalId),
        ativo: true,
      }),
    },
  });

  const result = await service.scheduleVisit(
    {
      pacienteId,
      profissionalId,
      tipo: VisitType.AVALIACAO,
      dataHoraInicio: "2026-07-10T10:00:00.000Z",
    },
    actor,
  );

  assert.equal(result.status, VisitStatus.AGENDADA);
  assert.equal(createdVisitPayload?.tipo, VisitType.AVALIACAO);
  assert.equal(createdVisitPayload?.status, VisitStatus.AGENDADA);
  assert.equal(createdVisitPayload?.pacienteId.toString(), pacienteId);
  assert.equal(createdVisitPayload?.profissionalId.toString(), profissionalId);
  assert.equal(
    createdVisitPayload?.historico[0].usuarioId.toString(),
    actor.usuarioId,
  );
  assert.equal(
    createdVisitPayload?.dataHoraFim.getTime(),
    new Date("2026-07-10T11:00:00.000Z").getTime(),
  );
});

test("rejeita a agendação quando o usuário não tem permissão de admin", async () => {
  const service = createService();

  await assert.rejects(
    () =>
      service.scheduleVisit(
        {
          pacienteId: new Types.ObjectId().toString(),
          profissionalId: new Types.ObjectId().toString(),
          tipo: VisitType.CURATIVO,
          dataHoraInicio: "2026-07-10T10:00:00.000Z",
        },
        {
          usuarioId: new Types.ObjectId().toString(),
          role: UserRole.PROFISSIONAL,
        },
      ),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal((error as AppError).statusCode, 403);
      return true;
    },
  );
});

test("rejeita a agendação quando já existe uma visita sobreposta", async () => {
  let createCalled = false;
  const service = createService({
    visitRepository: {
      create: async () => {
        createCalled = true;
        return { _id: new Types.ObjectId() };
      },
      hasOverlappingVisit: async () => true,
    },
    patientRepository: {
      findById: async () => ({ _id: new Types.ObjectId(), ativo: true }),
    },
    professionalRepository: {
      findById: async () => ({ _id: new Types.ObjectId(), ativo: true }),
    },
  });

  await assert.rejects(
    () =>
      service.scheduleVisit(
        {
          pacienteId: new Types.ObjectId().toString(),
          profissionalId: new Types.ObjectId().toString(),
          tipo: VisitType.FISIOTERAPIA,
          dataHoraInicio: "2026-07-10T10:00:00.000Z",
        },
        {
          usuarioId: new Types.ObjectId().toString(),
          role: UserRole.ADMIN,
        },
      ),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal((error as AppError).statusCode, 422);
      return true;
    },
  );

  assert.equal(createCalled, false);
});
