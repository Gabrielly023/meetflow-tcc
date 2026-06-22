# 📊 Relatório de Análise do Projeto

## 1. 🏗️ Identificação e visão geral

- **Nome do projeto:** MeetFlow
- **Objetivo identificado:** sistema para organização de eventos com recursos associados a usuários, eventos, participantes, galeria, músicas/playlists e chat.
- **Problema que o sistema pretende resolver:** gerenciamento centralizado de eventos, participantes, fotos, músicas e comunicação relacionada aos eventos. Essa finalidade foi inferida pelos nomes das entidades, textos do frontend e documentação de endpoints.
- **Funcionalidades do MVP descritas:**
  - cadastro e gerenciamento de usuários;
  - eventos criados ou participados pelo usuário;
  - playlists/músicas associadas a eventos;
  - galeria de fotos;
  - chat/comunicação do evento.
- **Tecnologias principais:**
  - Node.js
  - Express
  - Prisma ORM
  - MySQL/MariaDB
  - React
  - Vite
  - Tailwind CSS
  - Axios
- **Linguagens utilizadas:**
  - JavaScript
  - Prisma Schema
  - SQL
  - CSS
  - HTML

### Evidências consultadas

- `backend/package.json` — projeto backend nomeado como `meetflow-backend`, com Express, Prisma, CORS, dotenv, mysql2 e adapter MariaDB.
- `backend/prisma/schema.prisma` — models `Usuario`, `Evento`, `Participantes`, `Galeria`, `Musica`, `Chat` e `ChatLeitura`.
- `backend/src/server.js` — servidor Express configurado, CORS para o frontend Vite e rota `/usuarios`.
- `frontend/src/App.jsx` — tela inicial renderiza `Header` e `Cards`.
- `frontend/src/components/Cards/index.jsx` — cards estáticos para eventos, playlists e galeria.
- `frontend/src/services/usuarioService.js` — serviço Axios preparado para consumir `/usuarios`.
- `API-ENDPOINTS.md` — documentação das rotas de usuário.

## 2. 📂 Organização do repositório

```text
meetflow-tcc/
├── API-ENDPOINTS.md
├── PROMPT_ANALISE_REPOSITORIO_AV2_PIS.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── prisma.config.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       └── 20260520122747_init/
│   │           └── migration.sql
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   └── usuarioController.js
│       ├── routes/
│       │   └── usuarioRouter.js
│       └── server.js
└── frontend/
    ├── .gitignore
    ├── README.md
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── style.css
        ├── services/
        │   └── usuarioService.js
        └── components/
            ├── Cards/
            │   └── index.jsx
            ├── Header/
            │   └── index.jsx
            └── Playlist/
                └── index.jsx
```

### Responsabilidade das pastas

- `backend` — API Node.js/Express, Prisma, migrations e configuração de banco.
- `backend/src/config` — configuração do Prisma Client e conexão via adapter MariaDB.
- `backend/src/controllers` — funções de tratamento das requisições de usuário.
- `backend/src/routes` — definição das rotas HTTP de usuário.
- `backend/prisma` — schema Prisma e migrations.
- `frontend` — aplicação React criada com Vite.
- `frontend/src/components` — componentes visuais da interface.
- `frontend/src/services` — serviço HTTP preparado com Axios.

### Análise da organização

- Separação entre frontend e backend: adequada.
- Nomes de pastas e arquivos: em geral claros para uma estrutura inicial; o backend usa nomes coerentes como `controllers`, `routes` e `config`. Há uma pasta `Playlist` vazia, indicando componente ainda não desenvolvido.
- Arquivos de configuração: existem `package.json` separados, `vite.config.js`, `prisma.config.ts`, `.gitignore` no backend e frontend, além de `.env.example`.
- Organização mínima do projeto: atende parcialmente bem à etapa inicial. A separação principal existe, mas não há `README.md` na raiz e o frontend mantém o README padrão do Vite.

## 3. 📘 README e documentação inicial

**Localização:** `frontend/README.md`

Não foi identificado `README.md` na raiz do projeto. O README existente é o template padrão React + Vite.

| Item esperado | Situação | Evidência |
|---|---|---|
| Nome do projeto | Não atende | `frontend/README.md` contém `React + Vite`, não o nome MeetFlow. |
| Problema que o sistema resolve | Não atende | `frontend/README.md` descreve apenas o template Vite. |
| Objetivo do projeto | Não atende | `frontend/README.md` não descreve o objetivo do MeetFlow. |
| Funcionalidades do MVP | Não atende | `frontend/README.md` não lista funcionalidades do sistema. |
| Tecnologias utilizadas | Parcial | `frontend/README.md` cita React e Vite, mas não documenta backend, banco, Prisma ou Tailwind como stack do projeto. |
| Instruções para execução local | Parcial | `frontend/package.json` possui scripts do frontend; o README não documenta execução completa do projeto. |
| Divisão entre frontend, backend e banco | Não atende | Não há descrição da divisão no README. |

### Histórico de commits e participação

- Histórico disponível para análise: Sim.
- Participação dos integrantes identificável: Parcial.
- Evidências: `git log --oneline -n 20` mostrou commits recentes; `git shortlog -sne HEAD` identificou autores como `marcellep`, `mariab`, `hannahsophia`, `Gabrielly023`, `Maria Beatriz`, `Maria Beatriz Oliveira de Souza` e `hfcosta`. Isso indica participação no histórico, mas não comprova divisão real de tarefas nem autoria funcional por módulo.

> Não foi atribuída autoria individual de funcionalidades, pois o histórico por si só não comprova divisão de tarefas.

### Professor como colaborador

**Situação:** NÃO VERIFICÁVEL PELO REPOSITÓRIO

## 4. ⚙️ Backend

- **Localização:** `backend`
- **Linguagem:** JavaScript
- **Framework principal:** Express
- **Arquivo de inicialização:** `backend/src/server.js`
- **Servidor configurado:** Sim

### Estrutura identificada

- `backend/src/server.js` — cria o app Express, configura CORS, JSON, rota `/usuarios` e inicia o servidor.
- `backend/src/routes/usuarioRouter.js` — define rotas CRUD de usuário.
- `backend/src/controllers/usuarioController.js` — implementa operações Prisma para usuários.
- `backend/src/config/db.js` — cria Prisma Client com adapter MariaDB e variáveis de ambiente.
- `backend/prisma/schema.prisma` — modelagem do banco.

### Organização interna

- Rotas: presentes em `backend/src/routes/usuarioRouter.js`.
- Controllers: presentes em `backend/src/controllers/usuarioController.js`.
- Services: NÃO IDENTIFICADO.
- Middlewares: apenas middlewares globais do Express/CORS em `backend/src/server.js`.
- Configuração do banco: presente em `backend/src/config/db.js`.
- Validações: NÃO IDENTIFICADO.
- Tratamento de erros: parcial; há `try/catch` apenas na conexão inicial do banco em `backend/src/server.js`. As operações dos controllers não têm tratamento explícito.

### Funcionalidades implementadas

- Listar usuários — Evidência: `backend/src/controllers/usuarioController.js`.
- Buscar usuário por ID — Evidência: `backend/src/controllers/usuarioController.js`.
- Criar usuário — Evidência: `backend/src/controllers/usuarioController.js`.
- Atualizar usuário — Evidência: `backend/src/controllers/usuarioController.js`.
- Deletar usuário — Evidência: `backend/src/controllers/usuarioController.js`.

### Fluxo das requisições

```text
requisição /usuarios → usuarioRouter → usuarioController → prisma.usuario → banco de dados → resposta JSON
```

O fluxo está completo conceitualmente para usuário. Porém, há um ponto crítico: `backend/src/config/db.js` importa `../../generated/prisma/client.js`, mas o diretório `backend/generated` não está presente no repositório analisado e também está ignorado no `.gitignore`. Assim, a execução depende de geração local do Prisma Client, não comprovada pelo repositório.

## 5. 🗄️ Banco de dados e Prisma ORM

- **Tipo de banco:** MySQL/MariaDB
- **ORM:** Prisma
- **Configuração principal:** `backend/src/config/db.js` e `backend/prisma.config.ts`
- **Schema Prisma:** `backend/prisma/schema.prisma`
- **Migrations:** Sim
- **Localização das migrations:** `backend/prisma/migrations/20260520122747_init/migration.sql`

### Models ou entidades identificadas

- `Usuario` — usuário do sistema; campos principais: `id_usuario`, `nome`, `email`, `senha`, `foto_perfil`.
- `Evento` — evento organizado por usuário; campos principais: `id_evento`, `titulo`, `descricao`, `data_hora`, `localizacao`, `senha_acesso`, `id_usuario`.
- `Participantes` — relação entre usuário e evento; campos principais: `id_evento`, `id_usuario`, `status`, `papel`.
- `Galeria` — fotos associadas a evento e usuário; campos principais: `id_foto`, `url_foto`, `postado_em`, `id_evento`, `id_usuario`.
- `Musica` — músicas/playlists associadas a evento e usuário; campos principais: `id_musica`, `titulo`, `link_spotify`, `capa_url`, `criado_em`, `id_evento`, `id_usuario`.
- `Chat` — mensagens de evento; campos principais: `id_chat`, `conteudo`, `tipo`, `criado_em`, `id_evento`, `id_usuario`.
- `ChatLeitura` — controle de leitura de mensagens; campos principais: `id_chat`, `id_usuario`, `lido_em`.

### Modelagem

| Elemento | Situação | Evidência |
|---|---|---|
| Models principais definidos | Atende | `backend/prisma/schema.prisma` |
| Chaves primárias | Atende | `backend/prisma/schema.prisma` e `backend/prisma/migrations/20260520122747_init/migration.sql` |
| Chaves estrangeiras e relações | Atende | `backend/prisma/schema.prisma` e migration com `ALTER TABLE ... ADD CONSTRAINT` |
| Campos coerentes com o domínio | Atende | `backend/prisma/schema.prisma` possui usuários, eventos, participantes, galeria, música e chat |
| Prisma Client utilizado no backend | Parcial | `backend/src/config/db.js` instancia Prisma Client, mas importa client gerado não versionado em `backend/generated` |
| Operação real de banco em rota/controller | Atende | `backend/src/controllers/usuarioController.js` usa `prisma.usuario` em operações CRUD |

### Operações Prisma encontradas

- `findMany`, `findUnique` ou equivalente: `backend/src/controllers/usuarioController.js`
- `create`: `backend/src/controllers/usuarioController.js`
- `update`: `backend/src/controllers/usuarioController.js`
- `delete`: `backend/src/controllers/usuarioController.js`
- Outras operações: `prisma.$connect` em `backend/src/server.js`

### Banco no servidor de produção

A existência de `.env`, `.env.example`, `prisma.config.ts` e configuração por variáveis de ambiente indica preparação para conexão, mas não comprova criação efetiva do banco em servidor de produção.

**Situação:** PARCIALMENTE EVIDENCIADO

Não foi exposto conteúdo de variáveis sensíveis.

## 6. 🌐 Rotas da API e arquivo do Insomnia

### Rotas encontradas no backend

| Método | Endpoint | Arquivo | Operação realizada | Usa Prisma |
|---|---|---|---|---|
| GET | `/usuarios` | `backend/src/routes/usuarioRouter.js` | lista usuários via controller | Sim |
| GET | `/usuarios/:id` | `backend/src/routes/usuarioRouter.js` | busca usuário por ID | Sim |
| POST | `/usuarios` | `backend/src/routes/usuarioRouter.js` | cria usuário com JSON do corpo | Sim |
| PUT | `/usuarios/:id` | `backend/src/routes/usuarioRouter.js` | atualiza usuário por ID | Sim |
| DELETE | `/usuarios/:id` | `backend/src/routes/usuarioRouter.js` | remove usuário por ID | Sim |

### Adequação das rotas

- Uso adequado dos métodos HTTP: adequado para CRUD de usuários.
- Organização por funcionalidade: parcial; há apenas `usuarioRouter`.
- Clareza dos nomes: adequada para `/usuarios`.
- Existência de parâmetros: presente em rotas por `:id`.
- Recebimento de JSON: presente via `express.json()` em `backend/src/server.js`.
- Respostas em JSON: presente via `res.json()` e `res.status(201).json()`.
- Relação com funcionalidades essenciais do MVP: parcial; usuários estão contemplados, mas não há rotas para eventos, participantes, galeria, músicas/playlists ou chat, apesar de existirem models no Prisma.

### Arquivo exportado do Insomnia

- **Arquivo encontrado:** NÃO IDENTIFICADO
- **Formato:** NÃO IDENTIFICADO
- **Rotas organizadas por funcionalidade:** Não
- **Nomes claros nas requisições:** Não
- **Exemplos de corpo JSON:** Parcial, apenas em `API-ENDPOINTS.md`, que é documentação Markdown e não export do Insomnia.
- **Parâmetros e variáveis configurados:** Não
- **Compatibilidade com as rotas do backend:** Parcial no documento `API-ENDPOINTS.md`, mas não como arquivo exportado do Insomnia.

Não foi identificado arquivo exportado do Insomnia no repositório. A documentação `API-ENDPOINTS.md` descreve as rotas de usuário e exemplos, mas não substitui uma exportação do Insomnia.

## 7. 🎨 Frontend

- **Localização:** `frontend`
- **Framework:** React
- **Linguagem:** JavaScript
- **Ferramenta de criação/build:** Vite
- **Tailwind CSS:** Configurado
- **Roteamento:** NÃO IDENTIFICADO

### Arquivos principais

- `frontend/src/main.jsx` — ponto de entrada React.
- `frontend/src/App.jsx` — composição da tela principal.
- `frontend/vite.config.js` — configuração Vite com React, Babel e Tailwind.
- `frontend/src/index.css` — importa Tailwind e define estilos globais.
- `frontend/src/services/usuarioService.js` — serviço Axios para o backend.

### Páginas e componentes

- `frontend/src/components/Header/index.jsx` — cabeçalho com links Home e Playlist.
- `frontend/src/components/Cards/index.jsx` — cards estáticos de eventos, playlists e galeria.
- `frontend/src/components/Playlist/index.jsx` — arquivo existe, mas está vazio.

### Análise do desenvolvimento inicial

| Elemento | Situação | Evidência |
|---|---|---|
| Projeto React iniciado | Atende | `frontend/package.json`, `frontend/src/main.jsx`, `frontend/src/App.jsx` |
| Uso de JavaScript | Atende | arquivos `.jsx` e `.js` em `frontend/src` |
| Tailwind configurado ou utilizado | Atende | `frontend/vite.config.js`, `frontend/src/index.css`, classes Tailwind nos componentes |
| Telas principais iniciadas | Parcial | `frontend/src/App.jsx`, `frontend/src/components/Cards/index.jsx` |
| Componentes organizados | Parcial | `Header` e `Cards` existem; `Playlist` está vazio |
| Navegação entre páginas | Não atende | links com `href`, mas sem biblioteca de rotas nem páginas conectadas |
| Tela conectada ou preparada para API | Parcial | `frontend/src/services/usuarioService.js` existe, mas não é importado nem usado por `App` ou componentes |

O frontend foi iniciado com React, JavaScript e Tailwind. O desenvolvimento visível ainda é principalmente estático.

## 8. 🔗 Conexão entre frontend e backend

- **Tipo de comunicação:** REST
- **Cliente HTTP:** Axios
- **Arquivo de configuração da API:** `frontend/src/services/usuarioService.js`
- **URL base:** `http://localhost:3000`, encontrada em `frontend/src/services/usuarioService.js`
- **Variáveis de ambiente:** `backend/.env` e `backend/.env.example`
- **CORS no backend:** Configurado em `backend/src/server.js` para `http://localhost:5173`
- **Proxy no frontend:** Ausente

### Endpoints consumidos pelo frontend

| Endpoint | Método | Componente ou página | Finalidade | Compatível com o backend |
|---|---|---|---|---|
| `/usuarios` | GET | `frontend/src/services/usuarioService.js` | listar usuários | Sim |
| `/usuarios/:id` | GET | `frontend/src/services/usuarioService.js` | buscar usuário por ID | Sim |
| `/usuarios` | POST | `frontend/src/services/usuarioService.js` | criar usuário | Sim |
| `/usuarios/:id` | PUT | `frontend/src/services/usuarioService.js` | atualizar usuário | Sim |
| `/usuarios/:id` | DELETE | `frontend/src/services/usuarioService.js` | deletar usuário | Sim |

### Fluxos comprovados

- Serviço Axios preparado para listar, buscar, criar, atualizar e deletar usuários.
- Não foi comprovado fluxo de tela consumindo dados da API, pois `usuarioService.js` não é importado por `App.jsx`, `Header`, `Cards` ou `Playlist`.

### Estado da integração

**Classificação:** Parcial

Há comunicação preparada e compatível entre frontend e backend no arquivo de serviço, e o backend permite CORS do frontend Vite. Porém, a integração não está comprovada em uma tela funcional, pois os componentes renderizados são estáticos e não acionam o serviço HTTP.

## 9. ✅ O que já está implementado

### Backend

- Servidor Express configurado em `backend/src/server.js`.
- Middleware JSON configurado em `backend/src/server.js`.
- CORS configurado para `http://localhost:5173` em `backend/src/server.js`.
- Rotas CRUD de usuários em `backend/src/routes/usuarioRouter.js`.
- Controller de usuários com operações Prisma em `backend/src/controllers/usuarioController.js`.

### Banco de dados

- Schema Prisma com models de usuário, evento, participantes, galeria, música, chat e leitura de chat em `backend/prisma/schema.prisma`.
- Migration inicial SQL em `backend/prisma/migrations/20260520122747_init/migration.sql`.
- Relações e chaves estrangeiras definidas na migration.

### Frontend

- Projeto React/Vite iniciado.
- Tailwind configurado via plugin Vite e importado em CSS.
- Componentes `Header` e `Cards` implementados.
- Tela principal renderiza cabeçalho e cards.

### Integração

- Serviço Axios configurado para `http://localhost:3000`.
- Endpoints de usuário no serviço frontend são compatíveis com rotas do backend.
- CORS do backend permite origem padrão do Vite.

## 10. 🚧 O que está incompleto ou em desenvolvimento

- README do projeto não documenta o MeetFlow.
  - **Evidência:** `frontend/README.md`
  - **Estado observado:** arquivo mantém conteúdo padrão React + Vite; não há README na raiz.

- Export do Insomnia não encontrado.
  - **Evidência:** listagem do repositório e busca por arquivos JSON/YAML fora de dependências.
  - **Estado observado:** existe `API-ENDPOINTS.md`, mas não um arquivo exportado do Insomnia.

- Rotas do backend cobrem apenas usuários.
  - **Evidência:** `backend/src/routes/usuarioRouter.js`
  - **Estado observado:** não há rotas para eventos, participantes, galeria, músicas/playlists ou chat.

- Frontend ainda está majoritariamente estático.
  - **Evidência:** `frontend/src/App.jsx`, `frontend/src/components/Cards/index.jsx`
  - **Estado observado:** cards exibem conteúdo fixo e links simples; não há consumo de dados na tela.

- Serviço HTTP do frontend não está conectado a componentes.
  - **Evidência:** `frontend/src/services/usuarioService.js` e ausência de imports desse serviço nos componentes renderizados.
  - **Estado observado:** integração preparada, mas sem fluxo visual comprovado.

- Componente de playlist vazio.
  - **Evidência:** `frontend/src/components/Playlist/index.jsx`
  - **Estado observado:** arquivo com 0 bytes.

- Prisma Client gerado não está presente no repositório.
  - **Evidência:** `backend/src/config/db.js` importa `../../generated/prisma/client.js`; `backend/generated` não existe no repositório e é ignorado por `backend/.gitignore`.
  - **Estado observado:** execução depende de geração local não versionada.

- Validação e tratamento de erro nas rotas não foram identificados.
  - **Evidência:** `backend/src/controllers/usuarioController.js`
  - **Estado observado:** operações Prisma retornam JSON diretamente, sem validação explícita ou `try/catch` por rota.

## 11. 📦 Dependências principais

### Backend

| Dependência | Versão | Finalidade identificada |
|---|---:|---|
| `express` | `^5.2.1` | servidor HTTP e rotas |
| `cors` | `^2.8.6` | liberação de acesso do frontend |
| `dotenv` | `^17.4.2` | carregamento de variáveis de ambiente |
| `@prisma/client` | `^7.8.0` | client ORM Prisma |
| `prisma` | `^7.8.0` | CLI e ferramentas Prisma, dependência de desenvolvimento |
| `@prisma/adapter-mariadb` | `^7.8.0` | adapter Prisma para MariaDB |
| `mysql2` | `^3.22.3` | driver MySQL |
| `nodemon` | `^3.1.14` | execução em desenvolvimento, dependência de desenvolvimento |

### Frontend

| Dependência | Versão | Finalidade identificada |
|---|---:|---|
| `react` | `^19.2.6` | construção da interface |
| `react-dom` | `^19.2.6` | renderização React no DOM |
| `vite` | `^8.0.12` | ferramenta de desenvolvimento/build, dependência de desenvolvimento |
| `@vitejs/plugin-react` | `^6.0.1` | plugin React para Vite, dependência de desenvolvimento |
| `tailwindcss` | `^4.3.0` | framework CSS |
| `@tailwindcss/vite` | `^4.3.0` | plugin Tailwind para Vite |
| `axios` | `^1.18.0` | cliente HTTP |
| `eslint` | `^10.3.0` | lint, dependência de desenvolvimento |
| `autoprefixer` | `^10.5.0` | processamento CSS, dependência de desenvolvimento |
| `postcss` | `^8.5.15` | processamento CSS, dependência de desenvolvimento |

## 12. 🧭 Arquitetura e padrões identificados

- **Arquitetura predominante:** estrutura simples em camadas no backend; componentes no frontend.
- **Separação de responsabilidades:** parcial. O backend separa servidor, rotas, controllers e configuração do banco. O frontend separa componentes e serviço HTTP, mas o serviço não é utilizado pelas telas.
- **Padrões identificados:** CRUD REST para usuários, Prisma como camada de acesso a dados, componentes React funcionais.
- **Consistência entre os módulos:** parcial. O schema de banco é amplo e coerente com o domínio, mas as rotas implementadas cobrem apenas usuário. O frontend apresenta funcionalidades de eventos, playlists e galeria, porém sem rotas correspondentes implementadas.

# 13. 📝 Avaliação conforme os critérios da AV2

## Regras de pontuação

As notas abaixo consideram apenas evidências presentes no repositório. Itens dependentes de apresentação, acesso ao GitHub remoto, banco de produção ou execução externa foram marcados como não verificáveis quando aplicável.

## Quadro avaliativo

| Critério | Valor máximo | Nota atribuída | Evidências e justificativa |
|---|---:|---:|---|
| Organização do repositório, README e professor como colaborador | 1,5 | 0,9 | Há boa separação `backend`/`frontend` e estrutura mínima organizada. README do projeto não atende, pois só há README padrão do Vite em `frontend/README.md`. Professor como colaborador é NÃO VERIFICÁVEL PELO REPOSITÓRIO. |
| Banco de dados criado e coerente com o MVP | 2,0 | 1,6 | `schema.prisma` e migration definem models coerentes com usuários, eventos, participantes, galeria, música e chat. Criação em servidor de produção não é comprovável pelo repositório. |
| Arquivo exportado do Insomnia com as rotas organizadas | 1,5 | 0,3 | Não foi encontrado export do Insomnia. `API-ENDPOINTS.md` documenta rotas de usuário com exemplos, mas não é arquivo exportado e cobre apenas usuários. |
| Backend iniciado com integração ao banco usando Prisma ORM | 2,0 | 1,5 | Express, CORS, rotas e controller CRUD com Prisma existem. Há uso real de `prisma.usuario`. Porém, o Prisma Client gerado importado em `backend/src/config/db.js` não está presente no repositório e não há validação/tratamento de erro nas rotas. |
| Frontend iniciado em React, JavaScript e Tailwind | 1,5 | 1,2 | React/Vite iniciado, JavaScript usado, Tailwind configurado e componentes criados. Ainda há tela estática, componente `Playlist` vazio e sem roteamento real. |
| Conexão inicial entre frontend e backend | 1,0 | 0,6 | `usuarioService.js` usa Axios com base URL compatível e endpoints alinhados ao backend; CORS está configurado. Não há tela usando o serviço. |
| Clareza na apresentação e divisão de tarefas do grupo | 0,5 | NÃO VERIFICÁVEL | O histórico local mostra autores, mas a clareza da apresentação e a divisão real das tarefas dependem de verificação externa. |
| **Total verificável no repositório** | **10,0** | **6,1** | Soma dos itens pontuáveis por evidência direta, sem converter o critério não verificável em zero. |

### Observação sobre o total

- **Pontuação obtida nos itens verificáveis:** 6,1
- **Pontos dependentes de apresentação ou verificação externa:** 0,5
- **Nota máxima que pode ser confirmada apenas pelo repositório:** 9,5

O item de apresentação e divisão de tarefas depende de demonstração ou verificação externa pelo professor.

## 14. 📌 Síntese por critério

### 14.1 Organização do repositório e README — máximo 1,5

- **Situação:** Parcial
- **Evidências:** `backend`, `frontend`, `frontend/README.md`, `backend/.gitignore`, `frontend/.gitignore`
- **Aspectos comprovados:** separação entre backend e frontend; backend organizado em rotas, controllers, config e Prisma; frontend com componentes e serviço.
- **Aspectos ausentes:** README de projeto com nome, objetivo, problema, MVP, tecnologias completas e instruções integradas.
- **Aspectos não verificáveis:** professor como colaborador.
- **Nota sugerida:** 0,9/1,5

### 14.2 Banco de dados e coerência com o MVP — máximo 2,0

- **Situação:** Atende parcialmente
- **Evidências:** `backend/prisma/schema.prisma`, `backend/prisma/migrations/20260520122747_init/migration.sql`
- **Models/tabelas principais:** `Usuario`, `Evento`, `Participantes`, `Galeria`, `Musica`, `Chat`, `ChatLeitura`.
- **Coerência com o MVP:** boa coerência com funcionalidades de eventos, participantes, galeria, músicas e chat; backend ainda não expõe todas essas entidades.
- **Criação no servidor de produção:** Não verificável pelo repositório.
- **Nota sugerida:** 1,6/2,0

### 14.3 Insomnia e organização das rotas — máximo 1,5

- **Situação:** Não atende como export do Insomnia; atende parcialmente como documentação manual.
- **Evidências:** ausência de arquivo exportado; `API-ENDPOINTS.md`.
- **Organização das requisições:** documentada em Markdown para usuários.
- **Compatibilidade com o backend:** compatível para rotas de usuário, incompleta para demais funcionalidades.
- **Nota sugerida:** 0,3/1,5

### 14.4 Backend com Prisma ORM — máximo 2,0

- **Situação:** Parcial
- **Evidências:** `backend/src/server.js`, `backend/src/routes/usuarioRouter.js`, `backend/src/controllers/usuarioController.js`, `backend/src/config/db.js`, `backend/prisma/schema.prisma`
- **Servidor Node.js/Express:** configurado e iniciado por `src/server.js`.
- **Prisma configurado:** schema, migration e adapter MariaDB presentes; client gerado não versionado.
- **Operação no banco:** CRUD real de `usuario` nos controllers.
- **Resposta em JSON:** presente com `res.json()` e `res.status(201).json()`.
- **Nota sugerida:** 1,5/2,0

### 14.5 Frontend com React, JavaScript e Tailwind — máximo 1,5

- **Situação:** Parcial
- **Evidências:** `frontend/package.json`, `frontend/vite.config.js`, `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/index.css`, `frontend/src/components`
- **React iniciado:** sim.
- **JavaScript:** sim, arquivos `.js` e `.jsx`.
- **Tailwind:** configurado e utilizado em classes.
- **Telas e componentes:** tela inicial, header e cards iniciados; playlist vazia.
- **Nota sugerida:** 1,2/1,5

### 14.6 Conexão frontend-backend — máximo 1,0

- **Situação:** Parcial
- **Evidências:** `frontend/src/services/usuarioService.js`, `backend/src/server.js`, `backend/src/routes/usuarioRouter.js`
- **Fluxo identificado:** serviço Axios preparado para consumir `/usuarios`; backend expõe `/usuarios`.
- **Compatibilidade das rotas e dados:** compatível para usuário, mas sem consumo em componente renderizado.
- **Nota sugerida:** 0,6/1,0

### 14.7 Apresentação e divisão de tarefas — máximo 0,5

- **Situação:** Não verificável
- **Evidências no repositório:** histórico de commits com múltiplos autores, mas sem documento de divisão de tarefas.
- **O que precisa ser verificado na apresentação:** participação individual, divisão de responsabilidades, demonstração das partes implementadas e justificativa das decisões.
- **Nota sugerida:** A DEFINIR/0,5

## 15. 🔍 Pontos para verificação durante a apresentação

- Verificar se o backend executa corretamente apesar do Prisma Client gerado não estar presente no repositório.
- Verificar se a rota `GET /usuarios` retorna dados reais do banco.
- Verificar se `POST /usuarios`, `PUT /usuarios/:id` e `DELETE /usuarios/:id` funcionam com o banco configurado.
- Verificar se o banco de produção foi efetivamente criado e se contém as tabelas previstas na migration.
- Verificar se há arquivo exportado do Insomnia fora do repositório analisado.
- Verificar se a tela do frontend consome algum endpoint da API em execução.
- Verificar por que há models de eventos, músicas, galeria e chat sem rotas correspondentes.
- Verificar a divisão de tarefas entre os integrantes e a contribuição individual demonstrada.
- Verificar se o README final do projeto foi preparado em outro local ou ainda está pendente.

## 16. 📋 Conclusão

O projeto apresenta uma estrutura inicial consistente, com separação entre backend e frontend, backend Express organizado em rotas/controllers/configuração, modelagem Prisma abrangente e frontend React/Vite com Tailwind iniciado. A parte mais concreta do backend é o CRUD de usuários, que possui rotas, controller e operações Prisma reais.

O banco está bem modelado para o domínio proposto, com entidades relacionadas a usuários, eventos, participantes, galeria, músicas e chat, além de migration SQL correspondente. Entretanto, a criação em servidor de produção não é verificável pelo repositório, e o Prisma Client gerado usado pelo backend não está presente.

O frontend existe e tem componentes visuais iniciais, mas ainda é majoritariamente estático. A conexão frontend-backend está preparada por um serviço Axios compatível com as rotas de usuário e pelo CORS configurado no backend, porém não há tela renderizada usando esse serviço.

Os principais entregáveis ausentes ou incompletos são o README do projeto, o arquivo exportado do Insomnia, rotas para as demais entidades do MVP, integração visual real com a API e comprovação de divisão de tarefas. A apresentação deverá confirmar execução, banco de produção, participação dos integrantes e eventuais arquivos não presentes no repositório.

**Nota sugerida com base apenas nas evidências disponíveis no repositório:** 6,1 pontos nos itens verificáveis. O critério de apresentação e divisão de tarefas permanece a definir, pois é NÃO VERIFICÁVEL PELO REPOSITÓRIO.
