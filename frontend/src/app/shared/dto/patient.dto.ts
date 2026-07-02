export interface PatientDetailsDto {
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
