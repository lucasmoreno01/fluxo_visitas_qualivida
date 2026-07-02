import { VisitStatusObserver } from "./VisitStatusObserver";
import { VisitStatusChangedEvent } from "./VisitStatusChangedEvent";

export class VisitStatusAuditLogger implements VisitStatusObserver {
  async onStatusChanged(event: VisitStatusChangedEvent): Promise<void> {
    console.log(
      `[Visita ${event.visitId}] ${event.statusAnterior} -> ${event.statusNovo} (usuario ${event.usuarioId})`,
    );
  }
}
