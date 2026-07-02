import { VisitType } from "../../../domain/enums";
import { VisitEndDateCalculator } from "../VisitEndDateCalculator";

export class AvaliacaoEndDateCalculator implements VisitEndDateCalculator {
  readonly visitType = VisitType.AVALIACAO;

  calculateEndDate(startDate: Date): Date {
    return new Date(startDate.getTime() + 60 * 60 * 1000);
  }
}
