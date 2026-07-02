import { VisitStatusAuditLogger } from "./VisitStatusAuditLogger";
import { VisitStatusChangedEvent } from "./VisitStatusChangedEvent";
import { VisitStatusObserver } from "./VisitStatusObserver";

export class VisitStatusEventPublisher {
  private readonly observers: VisitStatusObserver[] = [];

  subscribe(observer: VisitStatusObserver): void {
    this.observers.push(observer);
  }

  async publish(event: VisitStatusChangedEvent): Promise<void> {
    await Promise.all(
      this.observers.map((observer) => observer.onStatusChanged(event)),
    );
  }
}

export const visitStatusEventPublisher = new VisitStatusEventPublisher();
visitStatusEventPublisher.subscribe(new VisitStatusAuditLogger());
