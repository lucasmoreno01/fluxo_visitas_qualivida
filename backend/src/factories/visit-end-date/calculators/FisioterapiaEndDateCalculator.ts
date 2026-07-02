import { VisitType } from "../../../domain/enums";
import { VisitEndDateCalculator } from "../VisitEndDateCalculator";

export class FisioterapiaEndDateCalculator implements VisitEndDateCalculator {
  readonly visitType = VisitType.FISIOTERAPIA;

  calculateEndDate(startDate: Date): Date {
    return new Date(startDate.getTime() + 45 * 60 * 1000);
  }
}
