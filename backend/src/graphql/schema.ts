export const typeDefs = `#graphql
  type VitalSigns {
    pressao: String
    temperatura: Float
    saturacao: Float
    frequenciaCardiaca: Float
  }

  type VisitHistoryItem {
    statusAnterior: String!
    statusNovo: String!
    timestamp: String!
    usuarioId: ID!
  }

  type Visita {
    id: ID!
    pacienteId: ID!
    profissionalId: ID!
    tipo: String!
    status: String!
    dataHoraInicio: String!
    dataHoraFim: String!
    motivoCancelamento: String
    historico: [VisitHistoryItem!]!
    criadoEm: String
    atualizadoEm: String
  }

  input AgendarVisitaInput {
    pacienteId: ID!
    profissionalId: ID!
    tipo: String!
    dataHoraInicio: String!
  }

  input VitalSignsInput {
    pressao: String
    temperatura: Float
    saturacao: Float
    frequenciaCardiaca: Float
  }

  input EvolutionInput {
    observacoes: String!
    sinaisVitais: VitalSignsInput
    procedimentosRealizados: String
    intercorrencias: String
    proximaVisitaRecomendada: String
  }

  input AtualizarStatusInput {
    status: String!
    motivoCancelamento: String
    evolucao: EvolutionInput
  }

  type Query {
    visitasDoDia(data: String!, profissionalId: ID): [Visita!]!
    visita(id: ID!): Visita
  }

  type Mutation {
    agendarVisita(input: AgendarVisitaInput!): Visita!
    atualizarStatusVisita(id: ID!, input: AtualizarStatusInput!): Visita!
  }
`;
