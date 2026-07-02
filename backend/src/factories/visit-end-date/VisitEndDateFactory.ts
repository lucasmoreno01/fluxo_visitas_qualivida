import { VisitType } from "../../domain/enums";
import { AppError } from "../../errors/AppError";
import { AvaliacaoEndDateCalculator } from "./calculators/AvaliacaoEndDateCalculator";
import { CurativoEndDateCalculator } from "./calculators/CurativoEndDateCalculator";
import { FisioterapiaEndDateCalculator } from "./calculators/FisioterapiaEndDateCalculator";
import { MedicacaoEndDateCalculator } from "./calculators/MedicacaoEndDateCalculator";
import { VisitEndDateCalculator } from "./VisitEndDateCalculator";

export class VisitEndDateFactory {
  private readonly calculators = new Map<VisitType, VisitEndDateCalculator>();

  constructor() {
    [
      new AvaliacaoEndDateCalculator(),
      new FisioterapiaEndDateCalculator(),
      new CurativoEndDateCalculator(),
      new MedicacaoEndDateCalculator(),
    ].forEach((calculator) => {
      this.calculators.set(calculator.visitType, calculator);
    });
  }

  getCalculator(visitType: VisitType): VisitEndDateCalculator {
    const calculator = this.calculators.get(visitType);

    if (!calculator) {
      throw new AppError("Tipo de visita sem calculadora de duracao.", 500);
    }

    return calculator;
  }

  calculateEndDate(startDate: Date, visitType: VisitType): Date {
    return this.getCalculator(visitType).calculateEndDate(startDate);
  }
}

export const visitEndDateFactory = new VisitEndDateFactory();
