# MeetFlow

Monorepositório com projetos npm independentes; não execute npm na raiz.

- `frontend/`: React 19, Vite 8, React Router 7 (`BrowserRouter`), Tailwind 4, Axios e Socket.IO Client. Entrada `src/main.jsx`; rotas em `src/App.jsx`; serviços em `src/services/`.
- `backend/`: JavaScript ESM, Express 5, Socket.IO, Prisma 7.10.1 com `@prisma/adapter-mariadb` e MySQL. Entrada `src/server.js`; controllers/routes em `src/`; schema e cinco migrations em `prisma/`. `mysql2` está declarado, mas o acesso ativo usa Prisma.
- Node: **24.x, mínimo 24.11.1**, configurado em ambos os `package.json`. Validação local com 24.11.1. Use um patch atualizado da linha 24 no Render.
- Frontend: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
- Backend: `npm run dev`, `npm start`, `npm test`, `npm run db:generate`, `npm run db:status`, `npm run db:deploy`.

## Deploy

### Frontend — Hostinger / Apache

1. Instale as dependências em `frontend` com `npm ci` (ou `npm install` para desenvolvimento).
2. Copie `.env.example` para `.env.development` e configure:

```dotenv
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=
```

Preencha o Client ID público do aplicativo Google. O botão de login autentica pelo Google uma conta já cadastrada no MeetFlow. No cadastro, a seleção Google continua preenchendo nome/e-mail, exigindo completar os demais campos. Autorize no Google Cloud a origem local e a origem HTTPS real da Hostinger, sem subpasta.

3. Copie `.env.example` para `.env.production`. Preencha `VITE_API_URL` com a **origem HTTPS real da API publicada no Render**, sem `/usuarios`, `/api`, subpasta ou credenciais, e `VITE_GOOGLE_CLIENT_ID` com o ID público autorizado. Nenhuma URL do Render foi inventada.
4. O caminho público informado é **`/tecti/2026/gpec12/`**. Está em `vite.config.js` (`base`) e `public/.htaccess` (`RewriteBase`). `BrowserRouter` usa `import.meta.env.BASE_URL`, resultando no basename `/tecti/2026/gpec12/`. Se o caminho mudar, altere Vite e `.htaccess` e gere nova build.
5. Execute, dentro de `frontend`:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

Acesse `http://127.0.0.1:4173/tecti/2026/gpec12/`, `/tecti/2026/gpec12/login` e atualize a página. O preview não interpreta `.htaccess`; teste o rewrite novamente no Apache real.

**Transfira o CONTEÚDO da pasta `dist` para a pasta correspondente ao projeto no servidor Apache.**

No FileZilla, abra localmente `frontend/dist/`, habilite a visualização de arquivos ocultos e envie `index.html`, `assets/`, SVGs públicos e `.htaccess` para a pasta física que corresponda à URL `/tecti/2026/gpec12/`. O document root/usuário FTP depende da conta Hostinger e não foi fornecido. Não crie uma pasta `dist` adicional no destino.

Estrutura final:

```text
[document root]/tecti/2026/gpec12/
  index.html
  assets/
  .htaccess
  meetflow-icon.svg
  ...demais arquivos de dist
```

Não envie `.env*`, `node_modules`, fontes, `.git`, backend, Prisma ou credenciais. Variáveis `VITE_*` são públicas e incorporadas no build; Apache não lê `.env.production`. Alterar a URL exige nova build e upload.

`public/.htaccess` é copiado automaticamente para `dist/.htaccess`:

```apache
Options -MultiViews
DirectoryIndex index.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /tecti/2026/gpec12/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
```

O Apache precisa permitir `.htaccess`/rewrite (`AllowOverride` adequado e `mod_rewrite`). Não há regras de domínio ou HTTPS. Se ocorrer 500, consulte o log/permissões de `Options` na hospedagem; se houver 404 ao atualizar `/login`, verifique rewrite e envio do arquivo oculto.

**A build inicial da auditoria usou valores de teste. Para publicar, confirme VITE_API_URL e VITE_GOOGLE_CLIENT_ID do ambiente de produção e gere uma nova dist; uma compilação bem-sucedida não valida a configuração externa.**

### Backend — Render

Não houve deploy nesta preparação. Após revisar as alterações, faça commit/push manualmente e selecione:

```text
Service Type: Web Service
Repository: https://github.com/Gabrielly023/meetflow-tcc
Branch: main (ou a branch de produção aprovada)
Root Directory: backend
Runtime: Node
Build Command: npm ci --include=dev && npm run db:generate
Start Command: npm start
Health Check Path: /health
Auto Deploy: desabilitado no primeiro deploy; habilitar após validar migrations e teste integrado
```

`npm start` executa `node src/server.js`, sem nodemon. O backend JavaScript não precisa de transpilação. O build inclui devDependencies porque o CLI Prisma está nesse grupo e gera `backend/generated/prisma`, ignorado pelo Git. Nenhuma migration é executada no build/start.

Variáveis no painel (preencha valores reais privadamente):

```dotenv
NODE_ENV=production
DATABASE_URL=
DB_SSL=true
DB_SSL_CA=
JWT_SECRET=
GOOGLE_CLIENT_ID=
FRONTEND_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

- `DATABASE_URL`: `mysql://USUARIO:SENHA@HOST:PORTA/BANCO`, codificando caracteres especiais no usuário/senha com percent-encoding. Não publique a URL.
- `DB_SSL=true`: TLS verificado no adapter de runtime. `DB_SSL_CA` é opcional: caminho do PEM da CA privada, disponibilizado por Secret File no Render. Não desligue verificação de certificado para contornar erro. Em desenvolvimento local sem TLS use `false`.
- `JWT_SECRET`: segredo aleatório exclusivo, ao menos 32 caracteres. `JWT_EXPIRES_IN` é opcional; padrão existente 30 minutos.
- `FRONTEND_URL`: somente a **origem** real (`https://` + domínio, eventualmente porta); **não** inclua `/tecti/2026/gpec12/`. CORS compara origem, não caminho. Express e Socket.IO usam a mesma configuração, com credentials e sem `*`.
- Cloudinary: armazenamento externo já utilizado para uploads; preencha os três valores da mesma conta. O disco efêmero do Render não é armazenamento persistente. A rota legada `/uploads` não deve ser usada para novos arquivos persistentes.
- SMTP: credenciais do provedor, remetente autorizado e porta. 465 ativa TLS direto; 587 usa negociação STARTTLS. Sem SMTP válido, recuperação de senha não funciona. Use plano/provedor Render que permita a conexão SMTP; verifique conectividade antes de publicar.
- **Não crie `PORT` manualmente no Render**: o servidor usa `process.env.PORT || 3000` e bind `0.0.0.0`.
- Node é selecionado pelo intervalo `>=24.11.1 <25` em `package.json`; não é necessário `NODE_VERSION` adicional.

`GET /health` retorna `{"status":"ok"}` sem consultar banco. Na inicialização, uma consulta `SELECT 1` valida a conexão; falha encerra o processo com código 1. Health é liveness, não comprovação contínua de disponibilidade do banco.

Use inicialmente **uma instância**: códigos de recuperação ficam em memória e salas Socket.IO não têm adapter distribuído. Reinício perde códigos pendentes. Não habilite escalabilidade horizontal sem persistência compartilhada/adaptação dessas partes.

### Banco

Biblioteca ativa: **Prisma 7.10.1 + adapter MariaDB para MySQL**. `DATABASE_URL` é lida tanto em `prisma.config.ts` (CLI) como em `src/config/db.js` (runtime). `DB_SSL` e `DB_SSL_CA` configuram **somente o runtime**. Para migrations com TLS, configure também os parâmetros TLS suportados pelo conector MySQL na `DATABASE_URL` do CLI e os arquivos CA correspondentes; confirme a orientação do provedor. Não confunda configuração TLS do adapter com a do CLI Prisma. Exemplo estrutural do CLI, preenchido privadamente: `mysql://USUARIO:SENHA@HOST:3306/BANCO?sslcert=/CAMINHO/ca.pem&sslaccept=strict`. O caminho do certificado deve existir no ambiente em que o CLI for executado.

Migrations existentes, preservadas sem alterações:

1. `20260819125516_init_v2`: tabelas iniciais.
2. `20260820143846_tabela_curtidas`: perfil e curtidas.
3. `20261014100000_evento_soft_delete`: lixeira de eventos.
4. `20261021110000_galeria_soft_delete`: lixeira da galeria.
5. `20261028000000_usuario_google_identity`: identificador Google opcional e único, preservando usuários existentes.

Não há seed configurado. O schema foi validado e o Client gerado. SQL das cinco migrations foi revisado, mas elas **não foram aplicadas a um banco** nesta tarefa.

Antes do primeiro start de produção, em ambiente confiável com o checkout exato da versão e `DATABASE_URL` de produção (ou Render Shell/one-off job quando disponível):

```sh
cd backend
npm ci --include=dev
npm run db:generate
npx prisma validate
npx prisma migrate status
npx prisma migrate deploy
npx prisma migrate status
```

`migrate status` pode retornar código diferente de zero quando há migrations pendentes; leia o resultado. Faça backup antes de aplicar. Em banco novo, as migrations criam as tabelas. Em banco existente criado por `db push`/SQL manual, verifique drift e faça baseline revisado antes de deploy; não marque migrations como aplicadas sem verificar o esquema. Não use `db push`, reset ou seed automático como fluxo de produção.

O servidor MySQL deve aceitar conexão remota do Render, com firewall/IPs autorizados, TLS e usuário de privilégio mínimo. O usuário das migrations precisa dos privilégios DDL correspondentes. Respeite nomes de tabelas com case: `usuario`, `Evento`, `Participantes`, `Galeria`, `GaleriaCurtida`, `Chat`, `RefreshToken`; Linux/MySQL pode ser sensível a case.

A rotina já existente remove permanentemente eventos que estão na lixeira há mais de 30 dias, no start e diariamente, com efeitos de cascade. Ela foi preservada. Revise backup e política de retenção antes do primeiro start com dados reais; **nenhum banco/dado foi apagado nesta auditoria**.

## Desenvolvimento local e validação

Crie `backend/.env` a partir de `backend/.env.example` sem sobrescrever um arquivo local já configurado. Preencha banco local, JWT, origem `http://localhost:5173`, Cloudinary e SMTP para testar esses recursos. Mantenha `NODE_ENV=development`, `PORT=3000`, `DB_SSL=false` se seu banco local não oferecer TLS.

Terminal backend:

```sh
cd backend
npm install
npm run db:generate
npx prisma validate
npm run db:status
# Apenas em banco de desenvolvimento escolhido, após revisar migrations:
npm run db:deploy
npm test
npm start
```

Terminal frontend:

```sh
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173/tecti/2026/gpec12/`. Teste `http://localhost:3000/health` e, autenticado, listagem/criação/leitura/atualização de eventos e galeria. Só prossiga depois de banco, login e serviços externos funcionarem.

## Teste integrado após publicação

Ordem operacional de dependências: **banco/migrations → Render → build com URL Render → Hostinger → testes integrados**.

1. Confirme `/health` na URL pública real do Render e logs de conexão MySQL.
2. Abra a origem real Hostinger + `/tecti/2026/gpec12/`; verifique CSS, JS e imagens sem 404.
3. Abra diretamente `/tecti/2026/gpec12/login` e atualize. Repita em `/eventos` autenticado.
4. Teste cadastro, login/senha, login Google, refresh de token e recuperação via e-mail.
5. Crie um evento de teste; liste, abra e atualize. Teste capa/galeria/curtidas no Cloudinary e inclusão de participantes.
6. Teste notificações e chat com duas contas autorizadas. Conta alheia/sem token não deve acessar notificações nem salas privadas.
7. Teste lixeira e restauração usando somente registros de teste; exclusão definitiva apenas quando intencional.
8. Teste mapas e playlists. Chat e playlists ainda têm partes em localStorage (`USE_API.chat=false`, `USE_API.playlists=false`); isso foi preservado, não é sincronização garantida pelo MySQL.
9. Confira Console, Network (URLs HTTPS Render, preflight CORS e WebSocket) e logs do Render. Não registre tokens/senhas em evidências públicas.

## Segurança e limites da auditoria

Dependências atualizadas após advisories npm. Cloudinary usa SDK 2.11.0 e um adapter Multer local em `src/config/cloudinaryStorage.js`: o antigo `multer-storage-cloudinary` exigia Cloudinary 1.x vulnerável. Pastas, formatos, transformação, limite e campos de retorno dos uploads foram preservados; valide upload real com a conta configurada antes de publicar. Auditoria npm final sem vulnerabilidades reportadas.


O `.env` antes versionado no frontend continha apenas `API_URL` sem valor; foi removido. O `.env` privado do backend foi preservado e já estava ignorado. Adicionado `.gitignore` na raiz para ambientes, dist, dependências e logs, preservando `.env.example`.

Não foram identificados segredos reais pelos padrões examinados nos arquivos e histórico acessível. O Google Client ID é público, agora configurável. Isso não é garantia de ausência de qualquer segredo: se uma credencial real tiver sido exposta em commits, documentos ou logs, **revogue/rotacione/substitua**, mesmo após remover o arquivo. Remover não limpa histórico nem cópias.

O relatório detalhado de evidências, arquivos e pendências está em [AUDITORIA_DEPLOY.md](AUDITORIA_DEPLOY.md). Não houve deploy, FTP, commit, push, migration aplicada ou alteração da infraestrutura.

Referências: [Node no Render](https://render.com/docs/node-version), [Express no Render](https://render.com/docs/deploy-node-express-app), [Prisma/MySQL](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql).

## Login com Google

Implementado em 28/10/2026. O frontend usa `GoogleLogin` de `@react-oauth/google` para obter um **ID token**, enviado como JSON `{ credential }` para `POST /usuarios/google`. O backend usa `google-auth-library` para verificar assinatura Google, audiência, emissor e validade, e exige e-mail verificado. E-mail enviado isoladamente não autentica.

Configure `GOOGLE_CLIENT_ID` no backend com o **mesmo valor público** de `VITE_GOOGLE_CLIENT_ID` no frontend. Não é um Client Secret. Sem essa variável, somente a rota Google retorna 503; login por senha continua disponível. O ID público existente foi copiado para o `.env` local do backend quando a variável ainda não existia. No Render, configure-a manualmente.

Antes de iniciar a nova versão contra um banco, aplique a migration aditiva que cria `usuario.google_sub`:

```sh
cd backend
npm install
npm run db:generate
npx prisma migrate status
npx prisma migrate deploy
npm test
npm start
```

A migration foi criada e o Client gerado nesta tarefa, mas **nenhuma migration foi aplicada ao banco**. Siga a orientação de backup/baseline da seção Banco. O campo opcional permite manter contas existentes.

Comportamento:

- Conta ainda não cadastrada: solicita cadastro; não cria usuário automaticamente.
- Primeiro acesso Gmail ou Workspace com e-mail verificado: vincula a conta existente pelo e-mail confirmado pelo Google.
- Primeiro acesso com endereço externo sem Workspace (por exemplo, Outlook): exige também a senha atual do MeetFlow. Preencha a senha na tela e clique novamente no botão Google para autorizar o vínculo.
- Acessos seguintes: identificam a conta pelo `sub` Google persistido, mesmo se o e-mail Google mudar.
- Uma identidade não pode sobrescrever o vínculo de outra; o índice único impede duplicação.
- Login bem-sucedido salva a sessão existente do MeetFlow e redireciona para `/usuarios`.

O fluxo usa callback JavaScript e JSON, não recebe POST de formulário do Google. Não utiliza cookies para criar a sessão. Não configure um redirect URI inventado no painel.

Configuração do Google Cloud pendente, a ser feita separadamente: cliente Web com origens JavaScript do desenvolvimento (`http://localhost:5173`), preview se utilizado (`http://localhost:4173`) e domínio HTTPS real da Hostinger, todos sem subpasta. Confirmar também audiência/publicação e usuários de teste quando aplicável. Nenhuma configuração do Google Cloud foi alterada.

Testes automatizados exercitam a rota HTTP com tokens RSA assinados localmente e verificação real da biblioteca Google; somente certificados e banco são substituídos por dados de teste. Cobrem assinatura inválida, audiência/emissor incorretos, expiração, e-mail não verificado, cadastro inexistente, vínculo, senha adicional, sessão e conflito de identidade. O teste real com Google e MySQL continua pendente de migration e configuração externa.

Validação desta implementação: 22 testes backend passaram; `prisma generate`, `prisma validate` e build frontend passaram. Testes não aplicam migrations nem acessam uma conta Google real.
