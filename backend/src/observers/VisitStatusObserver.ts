import { VisitStatusChangedEvent } from "./VisitStatusChangedEvent";

export interface VisitStatusObserver {
  onStatusChanged(event: VisitStatusChangedEvent): void | Promise<void>;
}
