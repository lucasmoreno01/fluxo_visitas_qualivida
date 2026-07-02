import { VisitType } from "../../../domain/enums";
import { VisitEndDateCalculator } from "../VisitEndDateCalculator";

export class MedicacaoEndDateCalculator implements VisitEndDateCalculator {
  readonly visitType = VisitType.MEDICACAO;

  calculateEndDate(startDate: Date): Date {
    return new Date(startDate.getTime() + 20 * 60 * 1000);
  }
}
