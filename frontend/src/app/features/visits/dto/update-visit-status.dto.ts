import { VisitStatus } from './visit.dto';

export interface EvolutionInputDto {
  observacoes: string;
  sinaisVitais: {
    pressao?: string;
    temperatura?: number | null;
    saturacao?: number | null;
    frequenciaCardiaca?: number | null;
  };
  procedimentosRealizados?: string;
  intercorrencias?: string;
  proximaVisitaRecomendada?: string | null;
}

export interface UpdateVisitStatusDto {
  status: VisitStatus;
  motivoCancelamento?: string;
  evolucao?: EvolutionInputDto;
}
