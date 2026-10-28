# Auditoria de preparação para deploy — 26/10/2026

## A. Situação

**PRONTO COM PENDÊNCIAS.** Código preparado para Apache na subpasta informada e Render Web Service. A publicação depende de URL real da API, origem Hostinger, credenciais, MySQL externo, migrations aplicadas manualmente e teste integrado. Nenhuma infraestrutura foi modificada. Nenhum commit/push/FTP/deploy/migration/reset foi feito.

**A dist inicial da auditoria foi gerada com valores fictícios.** Builds posteriores usam o ambiente local disponível. Antes de publicar, confira as variáveis de produção e gere novamente a dist.

## B. Problemas encontrados

### CRÍTICO

A auditoria inicial npm identificou 21 dependências afetadas no backend (uma crítica) e oito no frontend. Atualizações compatíveis corrigiram a cadeia; o SDK Cloudinary foi atualizado para 2.11.0 e o adaptador antigo removido porque exigia o SDK 1.x vulnerável. Resultado final: zero vulnerabilidades reportadas pelo npm.

Corrigidos: build quebrado por exports ausentes de recuperação de senha; backend sem start de produção; API e Socket.IO fixos em localhost; notificações e salas Socket.IO sem autenticação/isolamento; listagem pública de usuários com e-mail/telefone; códigos de recuperação escritos em logs sem SMTP e geração não criptográfica.

Pendência operacional: MySQL real e migrations não exercitados. O start já continha limpeza permanente de eventos excluídos há 30 dias, com cascades; foi preservada e nenhum start foi feito contra o banco real. Revisar backup/retenção antes do primeiro start.

Não foi confirmado segredo real versionado. O `.env` frontend rastreado tinha apenas uma chave sem valor, e o Google Client ID público não é segredo. Uma varredura por padrões não prova ausência absoluta. Qualquer credencial real previamente publicada deve ser revogada/rotacionada; remoção do Git atual não basta.

### IMPORTANTE

Corrigidos: base/basename/fallback Apache ausentes; CORS limitado a localhost; exemplos de env incompletos; Node não delimitado; Prisma Client ignorado sem passo explícito de geração; credenciais URL-encoded do banco não decodificadas; ausência de TLS configurável; falha do banco deixava o processo ativo sem encerrar.

Pendências: confirmar SMTP e Cloudinary; configurar origens autorizadas Google; executar testes de navegador e Linux real; manter auditoria periódica de dependências. Chat/playlists têm recursos locais já existentes (localStorage), preservados. Recuperação em memória e Socket.IO sem adapter compartilhado exigem uma instância inicialmente.

### MELHORIA

Health check sem dados sensíveis, validação explícita de ambiente e sete testes automatizados. Evoluções futuras fora desta preparação: persistência compartilhada da recuperação, rate limiting geral de login/cadastro, monitoramento e CI com MySQL/Linux. Não foi feita refatoração estética nem mudança de schema.

## C. Arquivos modificados/criados/removidos

| Arquivo | Motivo |
| --- | --- |
| `.gitignore` | Ignora ambientes privados, dependências, dist e logs, preservando exemplos. |
| `backend/.env.example` | Lista banco, TLS, JWT, CORS, Cloudinary e SMTP sem credenciais. |
| `backend/package.json` | Start de produção, scripts Prisma/testes, Node 24 e SDK Cloudinary corrigido. |
| `backend/package-lock.json` | Sincroniza engines e fixa atualizações de segurança compatíveis. |
| `backend/src/config/db.js` | Valida URL, decodifica credenciais e configura TLS/CA/timeouts. |
| `backend/src/config/cloudinaryStorage.js` | Adapter Multer para Cloudinary 2, preservando campos dos controllers e tratamento de falhas. |
| `backend/src/middlewares/uploadMiddleware.js` | Conecta uploads ao adapter compatível com SDK corrigido. |
| `backend/tests/cloudinaryStorage.test.js` | Testa streaming, campos de retorno, erros e limpeza sem acesso externo. |
| `backend/src/config/env.js` | Validação antecipada de variáveis e origem CORS. |
| `backend/src/controllers/notificacaoController.js` | Restringe acesso por usuário/organizador e remove detalhes internos de erros. |
| `backend/src/controllers/usuarioController.js` | Não registra código de recuperação, exige SMTP e limita tentativas por código. |
| `backend/src/routes/notificacaoRoutes.js` | Exige JWT nas notificações. |
| `backend/src/routes/usuarioRouter.js` | Exige JWT para leitura de perfis/lista com e-mail e telefone. |
| `backend/src/server.js` | CORS configurável, health, bind externo, autenticação/autorização Socket.IO e falha controlada de banco. |
| `backend/src/utils/recuperacaoSenha.js` | Gera códigos com aleatoriedade criptográfica. |
| `backend/tests/environment.test.js` | Testa configuração de produção/origem CORS. |
| `backend/tests/notifications.test.js` | Testa isolamento de notificações sem acessar banco. |
| `frontend/.env` | Removido arquivo versionado sem valores, substituído por exemplos e ambiente local ignorado. |
| `frontend/.env.example` | Define VITE_API_URL e VITE_GOOGLE_CLIENT_ID. |
| `frontend/package.json` | Define versão compatível de Node. |
| `frontend/package-lock.json` | Sincroniza engines e fixa atualizações de segurança compatíveis. |
| `frontend/README.md` | Aponta para o guia real de deploy, substituindo instruções genéricas. |
| `frontend/public/.htaccess` | Fallback SPA Apache na subpasta informada. |
| `frontend/src/App.jsx` | BrowserRouter usa basename derivado do Vite. |
| `frontend/src/main.jsx` | Google Client ID público configurável por ambiente. |
| `frontend/src/pages/Signup/index.jsx` | Remove chamada de localhost fixa. |
| `frontend/src/services/config.js` | Centraliza API em VITE_API_URL. |
| `frontend/src/services/notificacaoService.js` | Usa cliente central e JWT em notificações. |
| `frontend/src/services/socket.js` | Usa URL central e envia JWT no handshake. |
| `frontend/src/services/usuarioService.js` | Implementa as duas chamadas de recuperação que faltavam e quebravam o build. |
| `frontend/vite.config.js` | Base explícita e validação das variáveis de build. |
| `README.md` | Arquitetura, guia de deploy por ambiente, migrations, variáveis e testes. |
| `AUDITORIA_DEPLOY.md` | Evidências, pendências e inventário das alterações. |

Arquivo local ignorado criado: `frontend/.env.development`, com URL local e o Client ID público já usado pelo projeto. `backend/.env` privado foi preservado. Artefatos locais gerados: `frontend/dist` e `backend/generated/prisma`; não versionar.

## D. Frontend

```text
Frontend directory: frontend
Build command: npm run build
Build output: frontend/dist
Public path: /tecti/2026/gpec12/
Vite base: /tecti/2026/gpec12/
React Router basename: import.meta.env.BASE_URL (/tecti/2026/gpec12/)
.htaccess necessário: SIM
```

## E. Backend

```text
Backend directory: backend
Node version: 24.x >=24.11.1 <25
Root Directory: backend
Build Command: npm ci --include=dev && npm run db:generate
Start Command: npm start
Health Check: GET /health
Port configuration: process.env.PORT || 3000; bind 0.0.0.0
CORS configuration: FRONTEND_URL, origem sem subpasta, credentials true
Database library: Prisma 7.10.1 + @prisma/adapter-mariadb (MySQL)
Prisma migrations: SIM, quatro
```

## F. Variáveis de ambiente

- Frontend local: `VITE_API_URL=http://localhost:3000`, `VITE_GOOGLE_CLIENT_ID` público em `.env.development`.
- Frontend produção: mesmas duas variáveis em `.env.production`; API = origem HTTPS real do Render, Client ID autorizado. Resolvidas no build.
- Backend local: `NODE_ENV=development`, `PORT=3000`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL=http://localhost:5173`, `DB_SSL=false` (banco local sem TLS), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` em `.env`.
- Backend Render: mesmos parâmetros, `NODE_ENV=production`, `FRONTEND_URL` = origem HTTPS real da Hostinger, `DATABASE_URL` externo e `DB_SSL=true`. `DB_SSL_CA` opcional quando há CA privada. Não criar PORT. `JWT_EXPIRES_IN` opcional, padrão 30m.

## G. Render

```text
Service Type: Web Service
Repository: https://github.com/Gabrielly023/meetflow-tcc
Branch: main (identificada; selecionar branch de produção se diferente)
Root Directory: backend
Runtime: Node
Build Command: npm ci --include=dev && npm run db:generate
Start Command: npm start
Health Check Path: /health
Auto Deploy: desabilitado inicialmente; habilitar após validação
```

Variáveis copiáveis e significado em [README — Backend](README.md#backend--render). Migrations separadas do build/start; executar manualmente antes do primeiro start com dados reais.

## H. Hostinger / Apache

```text
Public path: /tecti/2026/gpec12/
Vite base: /tecti/2026/gpec12/
React Router basename: /tecti/2026/gpec12/
SPA fallback: index.html para caminhos que não são arquivos/diretórios
Arquivo .htaccess: frontend/public/.htaccess -> frontend/dist/.htaccess
Destino .htaccess: mesma pasta de index.html em /tecti/2026/gpec12/
Diretório local: frontend/dist
FileZilla: TODO O CONTEÚDO de dist, incluindo arquivo oculto .htaccess
```

O domínio e a raiz física FTP não foram informados; não foram inventados. Configuração do `.htaccess` e instruções em [README](README.md#frontend--hostinger--apache).

## I. Banco

Prisma + MariaDB adapter para MySQL; infraestrutura configurável em DATABASE_URL e TLS em DB_SSL/DB_SSL_CA. Quatro migrations coerentes com os campos/tabelas revisados no schema, sem execução contra banco. Sem seed configurado.

Comando recomendado: `npx prisma migrate deploy`, manual, acompanhado de `npx prisma migrate status` antes/depois. Banco existente sem histórico Prisma exige revisão/baseline; não executar cegamente. Validar firewall, permissões, TLS, nomes de tabelas e backup. Nenhuma migração destrutiva foi adicionada.

## J. Checklist e evidências

- [x] `npm install` funciona nos dois projetos.
- [x] `npm run build` funciona com variáveis de auditoria.
- [x] `dist` foi criada (rebuild obrigatório com valores reais).
- [x] Assets preparados para `/tecti/2026/gpec12/`.
- [x] Vite base correto.
- [x] React Router preparado.
- [x] `.htaccess` preparado e copiado para dist.
- [x] Código do frontend não depende de localhost fixo.
- [x] `VITE_API_URL` configurável.
- [x] Backend usa `process.env.PORT`.
- [x] Imports/caminhos revisados para Linux, sem divergências detectadas.
- [ ] Execução real em Linux (validação realizada em Windows).
- [x] `npm start` executa entrada de produção; HTTP/PORT testados.
- [ ] Start estável conectado ao banco real (não executado).
- [x] CORS preparado e testado para origem permitida/diferente.
- [x] Root Directory, Build Command e Start Command identificados.
- [x] Configuração do banco preparada para produção.
- [ ] Conexão/TLS/permissões no MySQL externo validados.
- [x] Migrations revisadas; `prisma generate` e `prisma validate` passaram.
- [ ] Migrations aplicadas e status de produção verificado.
- [x] Nenhum segredo real identificado nos padrões/arquivos examinados; .env privado ignorado.
- [x] `.env.example` existe nos dois projetos.
- [x] README contém instruções de deploy.
- [x] Sete testes backend passaram.
- [x] Preview HTTP: home, `/login`, `/recuperar-senha`, todos os JS/CSS e favicon retornaram 200.
- [x] API isolada: `/health` 200, CORS permitido/diferente, notificações sem token 401, WebSocket anônimo rejeitado, DB indisponível encerra com código 1.
- [ ] Navegador/Console, Apache real e teste integrado autenticado: pendentes. Browser automatizado indisponível.
- [x] Auditoria npm concluída após liberar rede: dependências corrigidas, zero vulnerabilidades reportadas nos dois projetos após atualização. Isso não garante ausência de vulnerabilidades desconhecidas.

# INSTRUÇÕES PARA FAZER O DEPLOY

As instruções completas, comandos, `.htaccess`, variáveis e testes estão no [README](README.md). Sequência operacional real: **ambiente 1 → ambiente 4 → ambiente 3 → ambiente 2 → ambiente 5**. O frontend de produção precisa da URL Render antes do build.

## AMBIENTE 1 — DESENVOLVIMENTO LOCAL

1. Criar/preencher `backend/.env` e `frontend/.env.development` conforme exemplos, preservando arquivos privados existentes.
2. Backend: `npm install`, `npm run db:generate`, `npx prisma validate`, `npm run db:status`; aplicar `npm run db:deploy` apenas no banco de desenvolvimento escolhido após revisão.
3. Executar `npm test` e `npm start`; conferir `/health`, login e operações de banco.
4. Frontend: `npm install`, `npm run dev`; abrir `http://localhost:5173/tecti/2026/gpec12/`.
5. Verificar cadastro/login, recuperação SMTP, Cloudinary, eventos e galeria antes de prosseguir. Revisar/commitar/enviar as alterações ao GitHub manualmente.

## AMBIENTE 2 — HOSTINGER / APACHE

Após ambientes 4 e 3: preencher `.env.production` com URL HTTPS real do Render e Client ID Google. Base e basename são `/tecti/2026/gpec12/`; usar o `.htaccess` documentado no README. Rodar `npm run build` em frontend e testar `npm run preview`.

Abrir `frontend/dist` no FileZilla e transferir seu conteúdo, incluindo `.htaccess`, para a pasta que corresponda a `/tecti/2026/gpec12/`. Não enviar fontes, ambientes, backend, node_modules ou `.git`. Testar a origem real + `/tecti/2026/gpec12/` e `/tecti/2026/gpec12/login`, incluindo atualização da rota interna. Repetir `/eventos` após autenticar.

## AMBIENTE 3 — RENDER

Usar campos exatos da seção G e variáveis da seção F/README. Uma instância; Auto Deploy inicialmente desabilitado. `FRONTEND_URL` aponta à origem Hostinger sem subpasta. Não definir PORT. Prisma Client é gerado no build; migrations são manuais, anteriores ao start.

Depois de publicar manualmente, testar URL pública real + `/health`, depois login e `/eventos` autenticado para confirmar banco. Verificar logs sem expor segredos. Copiar a origem HTTPS da API para `.env.production` do frontend.

## AMBIENTE 4 — BANCO DE DADOS DE PRODUÇÃO

Obter host, porta, usuário, senha, nome do banco e requisitos TLS/CA. Criar usuário/banco e liberar rede manualmente com provedor. Configurar DATABASE_URL, DB_SSL=true e DB_SSL_CA se necessário; CLI Prisma exige seus parâmetros TLS na URL.

Fazer backup. No backend com configuração segura de produção: `npm ci --include=dev`, `npm run db:generate`, `npx prisma migrate status`, `npx prisma migrate deploy`, `npx prisma migrate status`. Não há seed. Se houver tabelas sem histórico, revisar baseline antes. Confirmar conexão nos logs e em requisição autenticada que consulte dados; health sozinho não testa banco.

## AMBIENTE 5 — TESTE INTEGRADO FINAL

1. Abrir frontend e verificar assets.
2. Abrir `/login` diretamente e atualizar; autenticar e repetir em `/eventos`.
3. Testar chamadas HTTPS da API, cadastro/login e renovação de token.
4. Testar recuperação por e-mail e seleção Google.
5. Criar, listar, abrir e atualizar evento de teste.
6. Testar capa, upload/curtida de galeria, participantes e notificações.
7. Conferir chat com contas autorizadas e rejeição de acesso alheio; observar limites existentes de localStorage.
8. Testar lixeira/restauração e, somente em dados descartáveis, exclusão intencional.
9. Verificar mapas/playlists, Console, Network (CORS/WebSocket) e logs Render.

## Atualização — login Google em 28/10/2026

O login Google completo foi implementado após a auditoria inicial. Agora existe `POST /usuarios/google`, validação criptográfica com `google-auth-library`, vínculo persistido por `sub` e criação da sessão do MeetFlow. Cadastro prévio continua obrigatório; endereços externos sem Workspace exigem senha no primeiro vínculo. O cadastro por seleção Google mantém seu comportamento de preenchimento de dados.

Nova variável backend: `GOOGLE_CLIENT_ID`, igual a `VITE_GOOGLE_CLIENT_ID` do frontend. Nova migration: `20261028000000_usuario_google_identity` (campo opcional único). O total agora é cinco migrations. A nova migration **não foi aplicada**. O Google Cloud não foi alterado. Instruções e validações em [README — Login com Google](README.md#login-com-google).

Validação do login Google: 22 testes backend, geração/validação Prisma e build frontend passaram. Migration e autenticação real permanecem pendentes.
