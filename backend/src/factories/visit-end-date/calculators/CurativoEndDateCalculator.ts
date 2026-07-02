import { VisitType } from "../../../domain/enums";
import { VisitEndDateCalculator } from "../VisitEndDateCalculator";

export class CurativoEndDateCalculator implements VisitEndDateCalculator {
  readonly visitType = VisitType.CURATIVO;

  calculateEndDate(startDate: Date): Date {
    return new Date(startDate.getTime() + 30 * 60 * 1000);
  }
}
