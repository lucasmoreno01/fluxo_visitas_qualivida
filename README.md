# Fluxo de Visitas - Grupo Qualivida

Este projeto é uma modelagem em código de uma fatia da operação do **Grupo Qualivida**, uma empresa de saúde home care. O sistema gerencia visitas domiciliares de profissionais de saúde (médicos, enfermeiros e fisioterapeutas) a pacientes em Salvador, BA.

A aplicação conta com um backend robusto (API REST + GraphQL + MongoDB) e um aplicativo frontend desenvolvido em Angular para os profissionais de saúde.

---

## 🛠️ Stack Tecnológica

- **Backend:** Node.js (TypeScript) + Express + Mongoose + MongoDB + Apollo Server (GraphQL)
- **Frontend:** Angular 21 (TypeScript) + SCSS + Reactive Forms
- **Infraestrutura:** Docker & Docker Compose

---

## 🚀 Como Executar o Projeto

Certifique-se de ter o [Docker](https://www.docker.com/) instalado em sua máquina.

### 1. Subir os Containers
Execute o comando abaixo na raiz do projeto para construir e subir todos os serviços (MongoDB, Mongo Express, API Backend e Frontend Angular):

```bash
docker-compose up --build -d
```

### 2. Popular o Banco de Dados (Seed)
Após os containers estarem rodando com sucesso, execute o comando de seed para popular a base de dados com profissionais, pacientes e visitas de Salvador:

```bash
docker-compose exec api npm run seed
```

### 3. Acessar as Aplicações
- **Frontend Angular:** [http://localhost:4200](http://localhost:4200)
- **API REST (Base):** [http://localhost:3000](http://localhost:3000)
- **GraphQL Playground:** [http://localhost:3000/graphql](http://localhost:3000/graphql)
- **Mongo Express:** [http://localhost:8081](http://localhost:8081)

---

## 👥 Credenciais para Teste (Seed)

| Perfil (Role) | E-mail | Senha |
| :--- | :--- | :--- |
| **ADMIN** | `admin@qualivida.com` | `Admin@123` |
| **PROFISSIONAL** | `enfermeira@qualivida.com` | `Prof@123` |

---

## 🎨 Design Patterns Aplicados

Como parte do núcleo obrigatório, aplicamos dois design patterns clássicos na arquitetura do backend:

### 1. Repository Pattern
- **Onde foi aplicado:** Na pasta `backend/src/repositories/` (`VisitRepository`, `EvolutionRepository`, `ProfessionalRepository`, etc.).
- **Por que foi escolhido:** O pattern isola o acesso ao banco de dados da lógica de negócios. Todos os métodos de consulta e escrita do Mongoose/MongoDB ficam concentrados nas classes de repositório.
- **Como seria o código sem ele:** Os serviços (como `VisitSchedulingService` ou `VisitStatusService`) importariam e manipulariam diretamente os modelos do Mongoose (`VisitModel`, `EvolutionModel`, etc.). Caso houvesse necessidade de migrar de banco de dados (ex: MongoDB para PostgreSQL com Prisma), teríamos que reescrever a lógica interna de todos os serviços, violando o princípio de responsabilidade única.

### 2. Strategy Pattern
- **Onde foi aplicado:** Na pasta `backend/src/strategies/visita/` (`VisitStatusStrategy`, `AgendadaParaConfirmadaStrategy`, `ConfirmadaParaEmAndamentoStrategy`, `EmAndamentoParaConcluidaStrategy` e `VisitaParaCanceladaStrategy`).
- **Por que foi escolhido:** Cada transição de status de uma visita possui regras e validações específicas. O Strategy encapsula o comportamento de cada transição em sua própria classe. Um registro central (`VisitStatusStrategyRegistry`) gerencia o mapa de estratégias com base no status atual e no status desejado.
- **Como seria o código sem ele:** O método de atualização de status teria um bloco gigantesco e aninhado de `if-else` ou `switch-case` para validar cada estado atual em relação ao estado destino (ex: verificar se há evolução ao passar para `CONCLUIDA`, se há motivo de cancelamento ao passar para `CANCELADA`, etc.). Isso tornaria a manutenção difícil, propensa a bugs e violaria o princípio Aberto/Fechado (Open/Closed Principle).

---

## 🔗 Unificação REST & GraphQL

Para garantir o reaproveitamento máximo de código e evitar a duplicação de regras de negócio, o projeto foi arquitetado com uma separação clara entre a camada de transporte (REST e GraphQL) e a camada de domínio/serviços:

- **Serviços Compartilhados:** Toda a lógica de negócios (como a validação de sobreposição de horários, atomicidade de transações, validação de transição de status e permissões RBAC) está contida no diretório `backend/src/services/` (`VisitSchedulingService`, `VisitStatusService`, `VisitQueryService`).
- **REST:** O `VisitController` apenas extrai os parâmetros da requisição Express, valida a presença do usuário autenticado no token, chama o serviço adequado e retorna o resultado em JSON.
- **GraphQL:** Os resolvers em `backend/src/graphql/resolvers.ts` fazem exatamente o mesmo papel. Eles chamam os mesmos métodos dos serviços compartilhados (`VisitSchedulingService.scheduleVisit`, `VisitStatusService.updateStatus`, etc.).

Dessa forma, qualquer regra implementada na camada de serviço (por exemplo, a validação de sobreposição) é aplicada automaticamente tanto para agendamentos via REST (`POST /visitas`) quanto via GraphQL Mutation (`agendarVisita`).

---

## ⚙️ Regras de Negócio Críticas e Operação Atômica

1. **Sobreposição de Horários:** Calculada dinamicamente com base no tipo de visita:
   - `AVALIACAO` (60 min)
   - `FISIOTERAPIA` (45 min)
   - `CURATIVO` (30 min)
   - `MEDICACAO` (20 min)
   A validação é feita usando a lógica `(inicio_nova < fim_existente) AND (fim_nova > inicio_existente)` contra visitas não canceladas do profissional.
2. **Operação Atômica (Evolução + Status):** A conclusão de uma visita exige a criação de uma `Evolução`. A estratégia `EmAndamentoParaConcluidaStrategy` executa a criação da evolução e a alteração do status da visita para `CONCLUIDA` dentro de uma transação do MongoDB (através do `TransactionManager`). Se a criação da evolução ou o update da visita falharem, toda a operação sofre rollback.
3. **RBAC:** Admin possui acesso completo. Profissionais só enxergam e alteram suas próprias visitas e agendas, retornando `403 Forbidden` em caso de acesso indevido (tratado de forma consistente em ambos os controladores REST e GraphQL).

---

## ⚖️ Trade-offs e Melhorias Futuras

Caso tivéssemos mais tempo para o desenvolvimento, as seguintes melhorias seriam aplicadas:
1. **Testes Automatizados Completo:** Adicionar testes de integração cobrindo os resolvers de GraphQL e testes unitários focando no Rollback de transações em cenários de falha.
2. **Ambiente Multi-estágio real:** No frontend, utilizar builds multi-estágio reais com Nginx otimizado para o Docker de produção, em vez de expor o servidor de desenvolvimento Vite (Angular CLI) em todas as configurações.
3. **Tratamento de Fusos Horários:** A normalização de fusos horários e datas para UTC no banco e conversão local no frontend para evitar discrepâncias em Salvador, BA.

---

## 🤖 Uso de Inteligência Artificial

- **Ferramenta:** Gemini / Antigravity AI
- **Uso:** Utilizada para acelerar a dockerização do frontend Angular 21, criar as configurações do Dockerfile ajustadas para rodar o build no alpine, automatizar o reaproveitamento de código nos controladores REST de acordo com os resolvers do GraphQL e configurar o `.dockerignore` para diminuir o tempo de build em mais de 90%.
