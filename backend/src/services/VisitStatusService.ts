import { UserRole, VisitStatus } from "../domain/enums";
import { AppError } from "../errors/AppError";
import {
  EvolutionRepository,
  TransactionManager,
  VisitRepository,
} from "../repositories";
import {
  StatusPayload,
  VisitStatusStrategyRegistry,
  visitStatusStrategyRegistry,
} from "../strategies/visita";

export type StatusActorWithRole = {
  usuarioId: string;
  role: UserRole;
  profissionalId?: string;
};

const allowedTransitionsByRole = new Map<UserRole, VisitStatus[]>([
  [UserRole.ADMIN, [VisitStatus.CONFIRMADA, VisitStatus.CANCELADA]],
  [UserRole.PROFISSIONAL, [VisitStatus.EM_ANDAMENTO, VisitStatus.CONCLUIDA]],
]);

export class VisitStatusService {
  constructor(
    private readonly visitRepository = new VisitRepository(),
    private readonly evolutionRepository = new EvolutionRepository(),
    private readonly transactionManager = new TransactionManager(),
    private readonly strategyRegistry: VisitStatusStrategyRegistry = visitStatusStrategyRegistry,
  ) {}

  async updateStatus(
    id: string,
    payload: StatusPayload,
    actor: StatusActorWithRole,
  ) {
    const visita = await this.visitRepository.findById(id);

    if (!visita) {
      throw new AppError("Visita nao encontrada.", 404);
    }

    this.authorize(visita.profissionalId.toString(), payload.status, actor);

    const strategy = this.strategyRegistry.get(visita.status, payload.status);
    await strategy.validate(visita, payload);

    if (strategy.to !== VisitStatus.CONCLUIDA) {
      return strategy.execute(visita, payload, actor, {
        visitRepository: this.visitRepository,
        evolutionRepository: this.evolutionRepository,
      });
    }

    return this.transactionManager.runInTransaction(async (session) => {
      const freshVisit = await this.visitRepository.findById(id, session);

      if (!freshVisit) {
        throw new AppError("Visita nao encontrada.", 404);
      }

      const freshStrategy = this.strategyRegistry.get(
        freshVisit.status,
        payload.status,
      );
      await freshStrategy.validate(freshVisit, payload);

      return freshStrategy.execute(freshVisit, payload, actor, {
        visitRepository: this.visitRepository,
        evolutionRepository: this.evolutionRepository,
        session,
      });
    });
  }

  private authorize(
    visitProfessionalId: string,
    targetStatus: VisitStatus,
    actor: StatusActorWithRole,
  ): void {
    const allowedStatuses = allowedTransitionsByRole.get(actor.role) ?? [];

    if (!allowedStatuses.includes(targetStatus)) {
      throw new AppError("Usuario sem permissao para esta transicao.", 403);
    }

    if (
      actor.role === UserRole.PROFISSIONAL &&
      actor.profissionalId !== visitProfessionalId
    ) {
      throw new AppError("Profissional nao pode alterar visita de outro profissional.", 403);
    }
  }
}
