import { VisitType } from "../../domain/enums";

export interface VisitEndDateCalculator {
  readonly visitType: VisitType;
  calculateEndDate(startDate: Date): Date;
}
