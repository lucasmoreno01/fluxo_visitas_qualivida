import { GraphQLError } from "graphql";
import { UserRole, VisitStatus, VisitType } from "../domain/enums";
import { AppError } from "../errors/AppError";
import { VisitDocument } from "../models";
import { VisitQueryService } from "../services/VisitQueryService";
import { VisitSchedulingService } from "../services/VisitSchedulingService";
import { VisitStatusService } from "../services/VisitStatusService";
import { GraphqlContext } from "./context";

const visitQueryService = new VisitQueryService();
const visitSchedulingService = new VisitSchedulingService();
const visitStatusService = new VisitStatusService();

type ScheduleVisitArgs = {
  input: {
    pacienteId: string;
    profissionalId: string;
    tipo: VisitType;
    dataHoraInicio: string;
  };
};

type UpdateStatusArgs = {
  id: string;
  input: {
    status: VisitStatus;
    motivoCancelamento?: string;
    evolucao?: {
      observacoes: string;
      sinaisVitais?: {
        pressao?: string;
        temperatura?: number;
        saturacao?: number;
        frequenciaCardiaca?: number;
      };
      procedimentosRealizados?: string;
      intercorrencias?: string;
      proximaVisitaRecomendada?: string;
    };
  };
};

type DailyVisitsArgs = {
  data: string;
  profissionalId?: string;
};

export const resolvers = {
  Query: {
    visitasDoDia: async (
      _parent: unknown,
      args: DailyVisitsArgs,
      context: GraphqlContext,
    ) =>
      mapAppError(async () => {
        const user = requireAuthenticatedUser(context);
        const profissionalId = resolveProfessionalFilter(
          user.role,
          user.profissionalId,
          args.profissionalId,
        );

        const result = await visitQueryService.listVisits({
          data: new Date(args.data),
          profissionalId,
          page: 1,
          limit: 100,
        });

        return result.items;
      }),

    visita: async (
      _parent: unknown,
      args: { id: string },
      context: GraphqlContext,
    ) =>
      mapAppError(async () => {
        const user = requireAuthenticatedUser(context);
        const visit = await visitQueryService.findById(args.id);

        authorizeVisitRead(user.role, user.profissionalId, visit);

        return visit;
      }),
  },

  Mutation: {
    agendarVisita: async (
      _parent: unknown,
      args: ScheduleVisitArgs,
      context: GraphqlContext,
    ) =>
      mapAppError(() => {
        const user = requireAuthenticatedUser(context);

        return visitSchedulingService.scheduleVisit(args.input, {
          usuarioId: user.userId,
          role: user.role,
        });
      }),

    atualizarStatusVisita: async (
      _parent: unknown,
      args: UpdateStatusArgs,
      context: GraphqlContext,
    ) =>
      mapAppError(() => {
        const user = requireAuthenticatedUser(context);

        return visitStatusService.updateStatus(
          args.id,
          {
            ...args.input,
            evolucao: args.input.evolucao
              ? {
                  ...args.input.evolucao,
                  proximaVisitaRecomendada: args.input.evolucao
                    .proximaVisitaRecomendada
                    ? new Date(args.input.evolucao.proximaVisitaRecomendada)
                    : undefined,
                }
              : undefined,
          },
          {
            usuarioId: user.userId,
            role: user.role,
            profissionalId: user.profissionalId,
          },
        );
      }),
  },

  Visita: {
    id: (visit: VisitDocument) => visit.id,
    pacienteId: (visit: VisitDocument) => stringifyObjectId(visit.pacienteId),
    profissionalId: (visit: VisitDocument) =>
      stringifyObjectId(visit.profissionalId),
    dataHoraInicio: (visit: VisitDocument) => visit.dataHoraInicio.toISOString(),
    dataHoraFim: (visit: VisitDocument) => visit.dataHoraFim.toISOString(),
    criadoEm: (visit: VisitDocument) => visit.criadoEm?.toISOString(),
    atualizadoEm: (visit: VisitDocument) => visit.atualizadoEm?.toISOString(),
  },

  VisitHistoryItem: {
    timestamp: (item: { timestamp: Date }) => item.timestamp.toISOString(),
    usuarioId: (item: { usuarioId: unknown }) => stringifyObjectId(item.usuarioId),
  },
};

function requireAuthenticatedUser(context: GraphqlContext) {
  if (!context.user) {
    throw new AppError("Usuario nao autenticado.", 401);
  }

  return context.user;
}

function resolveProfessionalFilter(
  role: UserRole,
  actorProfessionalId?: string,
  requestedProfessionalId?: string,
): string | undefined {
  if (role === UserRole.ADMIN) {
    return requestedProfessionalId;
  }

  if (!actorProfessionalId) {
    throw new AppError("Profissional nao encontrado para este usuario.", 403);
  }

  if (requestedProfessionalId && requestedProfessionalId !== actorProfessionalId) {
    throw new AppError("Profissional nao pode ver visitas de outro profissional.", 403);
  }

  return actorProfessionalId;
}

function authorizeVisitRead(
  role: UserRole,
  actorProfessionalId: string | undefined,
  visit: VisitDocument,
): void {
  if (role === UserRole.ADMIN) {
    return;
  }

  if (stringifyObjectId(visit.profissionalId) !== actorProfessionalId) {
    throw new AppError("Profissional nao pode ver visita de outro profissional.", 403);
  }
}

async function mapAppError<T>(operation: () => Promise<T> | T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AppError) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: statusCodeToGraphqlCode(error.statusCode),
          http: { status: error.statusCode },
        },
      });
    }

    throw error;
  }
}

function statusCodeToGraphqlCode(statusCode: number): string {
  if (statusCode === 401) {
    return "UNAUTHENTICATED";
  }

  if (statusCode === 403) {
    return "FORBIDDEN";
  }

  if (statusCode === 422) {
    return "UNPROCESSABLE_ENTITY";
  }

  return "BAD_USER_INPUT";
}

function stringifyObjectId(value: unknown): string {
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }

  return String(value);
}
