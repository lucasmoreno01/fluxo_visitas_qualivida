import mongoose, { Types } from "mongoose";
import { connectDatabase } from "./database";
import {
  ProfessionalType,
  UserRole,
  VisitStatus,
  VisitType,
} from "./domain/enums";
import { visitEndDateFactory } from "./factories/visit-end-date";
import {
  EvolutionModel,
  PatientModel,
  ProfessionalModel,
  UserModel,
  VisitModel,
} from "./models";
import { hashPassword } from "./auth/password";

function atDay(hour: number, minute = 0, dayOffset = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function endDate(start: Date, type: VisitType): Date {
  return visitEndDateFactory.calculateEndDate(start, type);
}

function history(params: {
  from: VisitStatus;
  to: VisitStatus;
  usuarioId: Types.ObjectId;
  timestamp?: Date;
}) {
  return {
    statusAnterior: params.from,
    statusNovo: params.to,
    timestamp: params.timestamp ?? new Date(),
    usuarioId: params.usuarioId,
  };
}

async function clearDatabase() {
  await Promise.all([
    EvolutionModel.deleteMany({}),
    VisitModel.deleteMany({}),
    ProfessionalModel.deleteMany({}),
    PatientModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);
}

async function seed() {
  await connectDatabase();
  await clearDatabase();

  const adminPassword = await hashPassword("Admin@123");
  const professionalPassword = await hashPassword("Prof@123");

  const [adminUser, nurseUser, physioUser, doctorUser] = await UserModel.create([
    {
      nome: "Admin Qualivida",
      email: "admin@qualivida.com",
      senha: adminPassword,
      role: UserRole.ADMIN,
      ativo: true,
      criadoEm: new Date(),
    },
    {
      nome: "Ana Souza",
      email: "enfermeira@qualivida.com",
      senha: professionalPassword,
      role: UserRole.PROFISSIONAL,
      ativo: true,
      criadoEm: new Date(),
    },
    {
      nome: "Bruno Almeida",
      email: "fisio@qualivida.com",
      senha: professionalPassword,
      role: UserRole.PROFISSIONAL,
      ativo: true,
      criadoEm: new Date(),
    },
    {
      nome: "Carla Mendes",
      email: "medico@qualivida.com",
      senha: professionalPassword,
      role: UserRole.PROFISSIONAL,
      ativo: true,
      criadoEm: new Date(),
    },
  ]);

  const [nurse, physio, doctor] = await ProfessionalModel.create([
    {
      usuarioId: nurseUser._id,
      tipo: ProfessionalType.ENFERMEIRO,
      especialidade: "Curativos e medicacao domiciliar",
      ativo: true,
      maxVisitasDia: 6,
    },
    {
      usuarioId: physioUser._id,
      tipo: ProfessionalType.FISIOTERAPEUTA,
      especialidade: "Fisioterapia respiratoria e motora",
      ativo: true,
      maxVisitasDia: 5,
    },
    {
      usuarioId: doctorUser._id,
      tipo: ProfessionalType.MEDICO,
      especialidade: "Clinica medica",
      ativo: true,
      maxVisitasDia: 4,
    },
  ]);

  const [patientPituba, patientBarra, patientBrotas, patientOndina, patientItapua] =
    await PatientModel.create([
      {
        nome: "Maria de Lourdes Santos",
        telefone: "(71) 99911-1001",
        convenio: "QualiSaude",
        endereco: {
          rua: "Rua Amazonas",
          bairro: "Pituba",
          cidade: "Salvador",
          cep: "41830-380",
        },
        observacoes: "Paciente com mobilidade reduzida.",
        ativo: true,
      },
      {
        nome: "Jose Carlos Oliveira",
        telefone: "(71) 99922-2002",
        convenio: "VidaPlus",
        endereco: {
          rua: "Avenida Oceanica",
          bairro: "Barra",
          cidade: "Salvador",
          cep: "40140-130",
        },
        observacoes: "Portaria exige identificacao.",
        ativo: true,
      },
      {
        nome: "Helena Costa",
        telefone: "(71) 99933-3003",
        convenio: "SaudeLar",
        endereco: {
          rua: "Rua Waldemar Falcao",
          bairro: "Brotas",
          cidade: "Salvador",
          cep: "40295-010",
        },
        observacoes: "Preferencia por atendimento pela manha.",
        ativo: true,
      },
      {
        nome: "Roberto Lima",
        telefone: "(71) 99944-4004",
        convenio: "BemCuidar",
        endereco: {
          rua: "Avenida Anita Garibaldi",
          bairro: "Ondina",
          cidade: "Salvador",
          cep: "40170-130",
        },
        observacoes: "Paciente em acompanhamento pos-operatorio.",
        ativo: true,
      },
      {
        nome: "Luciana Ferreira",
        telefone: "(71) 99955-5005",
        convenio: "QualiSaude",
        endereco: {
          rua: "Rua Aristides Milton",
          bairro: "Itapua",
          cidade: "Salvador",
          cep: "41610-011",
        },
        observacoes: "Contato principal e a filha.",
        ativo: true,
      },
    ]);

  const visitSeeds = [
    {
      pacienteId: patientPituba._id,
      profissionalId: nurse._id,
      tipo: VisitType.CURATIVO,
      status: VisitStatus.CONFIRMADA,
      inicio: atDay(8),
      historico: [
        history({
          from: VisitStatus.AGENDADA,
          to: VisitStatus.CONFIRMADA,
          usuarioId: adminUser._id,
        }),
      ],
    },
    {
      pacienteId: patientBarra._id,
      profissionalId: nurse._id,
      tipo: VisitType.MEDICACAO,
      status: VisitStatus.AGENDADA,
      inicio: atDay(10),
      historico: [],
    },
    {
      pacienteId: patientBrotas._id,
      profissionalId: nurse._id,
      tipo: VisitType.CURATIVO,
      status: VisitStatus.EM_ANDAMENTO,
      inicio: atDay(14),
      historico: [
        history({
          from: VisitStatus.AGENDADA,
          to: VisitStatus.CONFIRMADA,
          usuarioId: adminUser._id,
        }),
        history({
          from: VisitStatus.CONFIRMADA,
          to: VisitStatus.EM_ANDAMENTO,
          usuarioId: nurseUser._id,
        }),
      ],
    },
    {
      pacienteId: patientOndina._id,
      profissionalId: physio._id,
      tipo: VisitType.FISIOTERAPIA,
      status: VisitStatus.CONFIRMADA,
      inicio: atDay(9),
      historico: [
        history({
          from: VisitStatus.AGENDADA,
          to: VisitStatus.CONFIRMADA,
          usuarioId: adminUser._id,
        }),
      ],
    },
    {
      pacienteId: patientItapua._id,
      profissionalId: physio._id,
      tipo: VisitType.FISIOTERAPIA,
      status: VisitStatus.CANCELADA,
      inicio: atDay(11),
      motivoCancelamento: "Paciente solicitou remarcacao.",
      historico: [
        history({
          from: VisitStatus.AGENDADA,
          to: VisitStatus.CANCELADA,
          usuarioId: adminUser._id,
        }),
      ],
    },
    {
      pacienteId: patientPituba._id,
      profissionalId: doctor._id,
      tipo: VisitType.AVALIACAO,
      status: VisitStatus.CONCLUIDA,
      inicio: atDay(15, 30, -1),
      historico: [
        history({
          from: VisitStatus.AGENDADA,
          to: VisitStatus.CONFIRMADA,
          usuarioId: adminUser._id,
        }),
        history({
          from: VisitStatus.CONFIRMADA,
          to: VisitStatus.EM_ANDAMENTO,
          usuarioId: doctorUser._id,
        }),
        history({
          from: VisitStatus.EM_ANDAMENTO,
          to: VisitStatus.CONCLUIDA,
          usuarioId: doctorUser._id,
        }),
      ],
    },
    {
      pacienteId: patientBarra._id,
      profissionalId: doctor._id,
      tipo: VisitType.AVALIACAO,
      status: VisitStatus.AGENDADA,
      inicio: atDay(16),
      historico: [],
    },
    {
      pacienteId: patientOndina._id,
      profissionalId: nurse._id,
      tipo: VisitType.MEDICACAO,
      status: VisitStatus.CONFIRMADA,
      inicio: atDay(8, 30, 1),
      historico: [
        history({
          from: VisitStatus.AGENDADA,
          to: VisitStatus.CONFIRMADA,
          usuarioId: adminUser._id,
        }),
      ],
    },
    {
      pacienteId: patientItapua._id,
      profissionalId: physio._id,
      tipo: VisitType.FISIOTERAPIA,
      status: VisitStatus.AGENDADA,
      inicio: atDay(13, 30, 1),
      historico: [],
    },
    {
      pacienteId: patientBrotas._id,
      profissionalId: doctor._id,
      tipo: VisitType.AVALIACAO,
      status: VisitStatus.CONFIRMADA,
      inicio: atDay(9, 30, 1),
      historico: [
        history({
          from: VisitStatus.AGENDADA,
          to: VisitStatus.CONFIRMADA,
          usuarioId: adminUser._id,
        }),
      ],
    },
  ];

  const visits = await VisitModel.create(
    visitSeeds.map((visit) => ({
      pacienteId: visit.pacienteId,
      profissionalId: visit.profissionalId,
      tipo: visit.tipo,
      status: visit.status,
      dataHoraInicio: visit.inicio,
      dataHoraFim: endDate(visit.inicio, visit.tipo),
      motivoCancelamento: visit.motivoCancelamento ?? null,
      historico: visit.historico,
    })),
  );

  const concludedVisit = visits.find(
    (visit) => visit.status === VisitStatus.CONCLUIDA,
  );

  if (concludedVisit) {
    await EvolutionModel.create({
      visitaId: concludedVisit._id,
      profissionalId: concludedVisit.profissionalId,
      observacoes:
        "Paciente avaliado em domicilio, consciente, orientado e sem queixas agudas.",
      sinaisVitais: {
        pressao: "120x80",
        temperatura: 36.5,
        saturacao: 98,
        frequenciaCardiaca: 76,
      },
      procedimentosRealizados: "Avaliacao clinica e orientacoes gerais.",
      intercorrencias: "Sem intercorrencias.",
      proximaVisitaRecomendada: atDay(15, 30, 6),
      criadoEm: new Date(),
    });
  }

  console.log("Seed concluido com sucesso.");
  console.log("Admin: admin@qualivida.com / Admin@123");
  console.log("Profissional: enfermeira@qualivida.com / Prof@123");
}

seed()
  .catch((error) => {
    console.error("Erro ao executar seed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
