export type VisitStatus = 'AGENDADA' | 'CONFIRMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';

export type VisitType = 'AVALIACAO' | 'CURATIVO' | 'FISIOTERAPIA' | 'MEDICACAO';

export interface PatientSummaryDto {
  _id?: string;
  id?: string;
  nome: string;
  telefone?: string;
  convenio?: string;
  endereco?: {
    rua?: string;
    bairro?: string;
    cidade?: string;
    cep?: string;
  };
  observacoes?: string;
  ativo?: boolean;
}

export interface ProfessionalSummaryDto {
  _id?: string;
  id?: string;
}

export interface VisitDto {
  _id?: string;
  id?: string;
  pacienteId: string | PatientSummaryDto;
  profissionalId: string | ProfessionalSummaryDto;
  tipo: VisitType;
  status: VisitStatus;
  dataHoraInicio: string;
  dataHoraFim: string;
  motivoCancelamento?: string | null;
}

export interface VisitsListResponseDto {
  data?: VisitDto[];
  items?: VisitDto[];
  visitas?: VisitDto[];
  total?: number;
}
