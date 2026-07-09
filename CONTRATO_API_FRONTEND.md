# 🤝 Contrato de API — o que o Frontend precisa do Backend

> **Para quem é este documento:** a dupla responsável pelo backend.
> **Objetivo:** listar exatamente quais rotas e quais formatos de JSON o
> frontend espera, para que o app deixe de usar o "backend falso"
> (localStorage) e passe a usar o backend real (Express + Prisma + MySQL).
>
> A maioria das tabelas já existe no `schema.prisma` (`Evento`,
> `Participantes`, `Galeria`, `Musica`, `Chat`) — nesses casos falta só
> **expor as rotas**. Algumas funcionalidades novas precisam de colunas/tabelas
> a mais (resumo em §5).

---

## 🆕 Novidades desta versão (o que mudou por último)

Grandes avanços no frontend — em ordem de impacto no backend:

- **Chat completamente reformulado (§4.5)** — agora tem: **responder/citar**,
  **reações (emoji)**, **enviar imagem**, **gravar e enviar áudio**, **editar**,
  **apagar**, **confirmação de leitura ("visto")**, **mensagens de sistema**,
  **busca** e **não-lidas**.
- **Grupo do chat (§4.8) — ENTIDADE NOVA** — cada evento tem um "grupo" (estilo
  WhatsApp) com **nome próprio** (pode diferir do título do evento),
  **descrição**, **foto**, **papel de parede** e **admins**. O criador nomeia
  admins; só admins adicionam/removem participantes.
- **Participantes já na criação (§4.1/§4.2)** — dá pra convidar gente na hora de
  criar o evento (não só depois no chat).
- **Mapas: Waze além do Google (§4.6)** — o usuário escolhe Google Maps **ou**
  Waze ao colar o link. Pro backend muda quase nada (é só o link salvo).

Versões anteriores já haviam adicionado (mantidos abaixo): término do evento
(`data_hora_fim`, §4.1), playlist principal (§4.4), mapas/locais (§4.6) e campos
extras de perfil (§4.7).

> O que **não** muda a API (é só lógica de frontend): criar evento já com
> mapa/playlist, ordenar tudo por data, editar qualquer evento, derivar o embed
> do mapa, e o papel de parede/predefinições (o front só guarda um valor).

---

## 1. Como o frontend está preparado

O frontend isola **todo** acesso a dados em uma camada de serviços
(`frontend/src/services/`). Cada entidade tem um **interruptor**:

```js
// frontend/src/services/config.js
export const USE_API = {
  usuarios: true,   // já usa o backend real
  eventos: false,   // vira true quando as rotas de evento existirem
  playlists: false,
  galeria: false,
  chat: false,
  mapas: false,
};
```

Quando vocês entregarem as rotas de uma entidade, a dupla do frontend vira a
flag dela para `true`. **Não precisamos que vocês mexam no frontend** — só
precisamos que as rotas existam e devolvam o JSON no formato descrito aqui.

---

## 2. Convenções gerais

| Item | Valor |
|---|---|
| **Base URL** | `http://localhost:3000` |
| **Formato** | JSON (`Content-Type: application/json`) |
| **Autenticação** | JWT no header `Authorization: Bearer <token>` (o token vem do `POST /usuarios/login`, que **já existe**) |
| **Usuário atual** | Deve sair do token (`req.usuario.id_usuario`), não do body |
| **Erros** | `{ "mensagem": "texto do erro" }` com status apropriado |

**Status codes usados:** `200` ok · `201` criado · `400` dados inválidos ·
`401` não autenticado · `403` sem permissão · `404` não encontrado ·
`409` conflito · `500` erro do servidor.

> ⚠️ **Importante:** quase todas as rotas abaixo precisam saber **quem é o
> usuário logado** (para checar se ele é o dono do evento/foto/música/local).
> Isso deve vir de um **middleware de autenticação** que lê o JWT. Recomendo
> criar um `authMiddleware.js` e aplicá-lo nas rotas protegidas.

---

## 3. O que já existe ✅

Rotas de usuário já implementadas em `backend/src/routes/usuarioRouter.js`:

| Método | Rota | Função |
|---|---|---|
| `POST` | `/usuarios` | cadastro (com bcrypt) |
| `POST` | `/usuarios/login` | login (devolve `token` JWT) |
| `GET` | `/usuarios` | listar |
| `GET` | `/usuarios/:id` | buscar por id |
| `PUT` | `/usuarios/:id` | atualizar |
| `DELETE` | `/usuarios/:id` | deletar |

Essa parte está pronta e o frontend já sabe consumir. O que falta são as
**outras entidades** ↓

---

## 4. Rotas a implementar

### 4.1 Eventos

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/eventos` | lista os eventos do usuário logado (que ele criou **ou** participa) |
| `GET` | `/eventos/:id` | detalhe de um evento |
| `POST` | `/eventos` | cria evento (o logado vira **organizador**) |
| `PUT` | `/eventos/:id` | atualiza (só o organizador) |
| `DELETE` | `/eventos/:id` | exclui (só o organizador) |

**Body do POST/PUT (o que o front envia):**

```json
{
  "titulo": "Noite de Música",
  "descricao": "Texto opcional",
  "data_hora": "2026-07-12T20:00:00.000Z",
  "data_hora_fim": "2026-07-12T23:00:00.000Z",
  "localizacao": "Centro Cultural",
  "senha_acesso": "1234",
  "tipo": "Show",
  "capa_url": "https://..."
}
```

**Response esperado (GET/POST/PUT) — um evento:**

```json
{
  "id_evento": "uuid",
  "id_usuario": "uuid-do-organizador",
  "titulo": "Noite de Música",
  "descricao": "...",
  "data_hora": "2026-07-12T20:00:00.000Z",
  "data_hora_fim": "2026-07-12T23:00:00.000Z",
  "localizacao": "Centro Cultural",
  "senha_acesso": "1234",
  "tipo": "Show",
  "capa_url": "https://...",
  "playlist_spotify": "https://open.spotify.com/playlist/XXXX"
}
```

> 🟥 **Colunas que o schema ainda NÃO tem.** O model `Evento` precisa de:
> `tipo` (ex.: "Show", "Social"), `capa_url` (imagem de capa) e `data_hora_fim`
> (término, opcional). Sugestão:
>
> ```prisma
> model Evento {
>   // ...campos existentes...
>   tipo           String?   @db.VarChar(50)
>   capa_url       String?   @db.VarChar(500)
>   data_hora_fim  DateTime?
>   playlist_spotify String? @db.VarChar(500)  // ver §4.4
> }
> ```
> Depois rodem `npx prisma migrate dev`. Se preferirem **não** adicionar algum,
> me avisem — o front guarda localmente como fallback, mas o ideal é ter no banco.

---

### 4.2 Participantes (de um evento)

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/eventos/:id/participantes` | lista os participantes do evento |
| `POST` | `/eventos/:id/participantes` | adiciona/entra no evento |
| `DELETE` | `/eventos/:id/participantes/me` | o logado **sai** do evento |
| `DELETE` | `/eventos/:id/participantes/:idUsuario` | um **admin** remove outro participante (ver §4.8) |

**Response do GET — lista** (agora com o campo `admin`, ver §4.8):

```json
[
  { "id_usuario": "uuid", "nome": "Ana", "papel": "convidado", "status": "confirmado", "admin": true }
]
```

> O front hoje mostra participantes como `{ id, name }`. O `nome` precisa vir
> do **join** com a tabela `usuario` (a tabela `Participantes` só tem os ids).

> 🟨 **Participantes na criação do evento.** O formulário de criar evento agora
> tem um campo "Participantes" — os convidados informados ali entram no grupo já
> na criação. No **mock atual**, o participante é só um **nome livre** (texto).
> No backend real, participante é um **usuário** (precisa de conta): a forma
> ideal é o front criar o evento e, em seguida, adicionar cada um via
> `POST /eventos/:id/participantes` **por username/email/id** (não por nome
> solto). Quando vocês definirem como será o "convidar" (por username? email?),
> a gente adapta o campo do front. Enquanto isso, dá pra aceitar `{ "nome": "..." }`
> como placeholder.

**Body do POST (`/eventos/:id/participantes`):**

```json
{ "senha_acesso": "1234" }          // para o próprio logado entrar
{ "username": "ana" }               // um admin adicionando alguém (ver §4.8)
```

---

### 4.3 Galeria (fotos de um evento)

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/eventos/:id/galeria` | lista as fotos do evento |
| `POST` | `/eventos/:id/galeria` | adiciona foto (dono = logado) |
| `DELETE` | `/galeria/:idFoto` | remove foto (só o dono da foto) |

**Response do GET — lista:**

```json
[
  { "id_foto": "uuid", "url_foto": "https://...", "id_usuario": "uuid-dono", "postado_em": "2026-07-01T12:00:00.000Z" }
]
```

**Body do POST:**

```json
{ "url_foto": "https://..." }
```

> 🟨 **Sobre o upload:** hoje o front reduz a imagem e guarda como *data URL*.
> Para o backend real, o ideal é a foto ser enviada e vocês devolverem uma
> `url_foto`. Se não houver storage de arquivos, dá para aceitar a data URL
> como string mesmo (a coluna `url_foto` é `VarChar(500)` — pode ficar curta;
> considerem aumentar para `Text` se forem guardar data URLs).
>
> 🟥 **Curtidas de foto não existem no schema.** O front deixa curtir fotos.
> Se quiserem persistir isso, criem uma tabela de curtidas (ver §5).

---

### 4.4 Playlist e Músicas (de um evento)

O front tem **dois conceitos** para o mesmo evento:

1. **Playlist principal do evento** — um único embed do Spotify (é o player que
   toca na barra lateral). Hoje é só um link salvo.
2. **Lista colaborativa de músicas** — cada participante adiciona faixas do
   Spotify e vota nas favoritas. **Mapeia direto no model `Musica`.**

**Rotas da playlist principal (embed único):**

| Método | Rota | O que faz |
|---|---|---|
| `PUT` | `/eventos/:id/playlist` | define/troca a playlist do evento |
| `DELETE` | `/eventos/:id/playlist` | remove a playlist do evento |

**Body do PUT:** `{ "link_spotify": "https://open.spotify.com/playlist/XXXX" }`

> O valor atual pode vir no próprio `GET /eventos/:id` (campo
> `playlist_spotify`). Precisa da coluna `playlist_spotify` em `Evento` (§5).

**Rotas da lista colaborativa de músicas:**

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/eventos/:id/musicas` | lista as músicas do evento (ordenadas por votos) |
| `POST` | `/eventos/:id/musicas` | adiciona música (dono = logado) |
| `DELETE` | `/musicas/:idMusica` | remove música (só o dono) |
| `POST` | `/musicas/:idMusica/voto` | alterna o voto do logado (curtir/descurtir) |

**Body do POST:**

```json
{ "link_spotify": "https://open.spotify.com/track/XXXX" }
```

**Response do GET — lista:**

```json
[
  {
    "id_musica": "uuid",
    "link_spotify": "https://open.spotify.com/track/XXXX",
    "capa_url": "https://...",
    "id_usuario": "uuid-dono",
    "votos": ["uuid-user-1", "uuid-user-2"]
  }
]
```

> 🟥 **Votos de música não existem no schema.** O campo `votos` (lista de quem
> votou) precisa de uma tabela nova (ver §5). Alternativa mais simples: uma
> coluna `total_votos Int @default(0)` em `Musica` — mas aí o front não
> consegue saber se **o usuário atual** já votou. O ideal é a tabela.

---

### 4.5 Chat (de um evento) — 🆕 AMPLIADO (chat "recheado")

O chat evoluiu bastante no frontend: além de enviar/listar mensagens, ele tem
**responder/citar, reações (emoji), imagem, editar, apagar, confirmação de
leitura ("visto"), mensagens de sistema e busca**. Boa parte já é prevista pelo
schema (o enum `TipoChat = mensagem | imagem | sistema` e a tabela
`ChatLeitura`); o resto precisa de poucas colunas/rotas a mais (resumo abaixo).

> **Importante:** tudo isso já funciona hoje no front via localStorage. Nada
> quebra se vocês entregarem por partes — só implementem as rotas na ordem que
> der, e a gente liga `USE_API.chat`.

**Rotas:**

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/eventos/:id/chat` | lista as mensagens do evento (ordenadas por data) |
| `POST` | `/eventos/:id/chat` | envia mensagem (autor = logado) |
| `PUT` | `/chat/:idChat` | edita o conteúdo (só o autor) |
| `DELETE` | `/chat/:idChat` | apaga a mensagem (autor **ou** organizador) |
| `POST` | `/chat/:idChat/reacao` | alterna a reação do logado (`{ "emoji": "👍" }`) |
| `POST` | `/eventos/:id/chat/lido` | marca todas as mensagens do evento como lidas pelo logado |

**Body do POST (enviar):**

```json
{
  "conteudo": "Texto da mensagem",
  "tipo": "mensagem",
  "imagem_url": null,
  "audio_url": null,
  "duracao": null,
  "responder_a": "uuid-da-mensagem-citada-ou-null"
}
```

> - Para **imagem**: `tipo: "imagem"` + `imagem_url` com a URL (ou data URL).
> - Para **áudio** (gravado no chat): `tipo: "audio"` + `audio_url` com o arquivo
>   (o front hoje manda uma data URL `audio/webm`; com storage real, mandaria a
>   URL) + `duracao` em segundos.
> - Para **mensagem de sistema** ("Fulano entrou"), o backend pode gerar com
>   `tipo: "sistema"`.

**Response do GET — lista (um item):**

```json
[
  {
    "id_chat": "uuid",
    "id_evento": "uuid",
    "id_usuario": "uuid-autor",
    "autor_nome": "Ana",
    "conteudo": "A banda confirmou o set list?",
    "tipo": "mensagem",
    "imagem_url": null,
    "criado_em": "2026-07-01T12:00:00.000Z",
    "editado_em": null,
    "excluido": false,
    "responder_a": {
      "id_chat": "uuid-citada",
      "autor_nome": "Bruno",
      "conteudo": "trecho citado"
    },
    "reacoes": { "👍": ["uuid-user-1"], "❤️": ["uuid-user-2"] },
    "lido_por": ["uuid-user-1", "uuid-user-2"]
  }
]
```

> - `autor_nome` vem do **join** com `usuario`.
> - `responder_a` pode ser `null`; quando existe, traz um resumo da mensagem citada.
> - `reacoes` é um mapa `emoji -> [ids de quem reagiu]`.
> - `lido_por` é a lista de ids que já leram (vem da tabela `ChatLeitura`).
> - `excluido` = mensagem apagada (o front mostra "mensagem apagada").

> 🟥 **Faltam no schema do `Chat`:** `imagem_url String? @db.VarChar(500)`,
> `audio_url String? @db.VarChar(500)`, `duracao Int?`, `editado_em DateTime?`,
> `excluido Boolean @default(false)` e `responder_a String?` (FK auto-relacional
> para `id_chat`). O enum `TipoChat` também precisa do valor **`audio`**. E uma
> tabela nova de reações:
>
> ```prisma
> model ChatReacao {
>   id_chat    String
>   id_usuario String
>   emoji      String  @db.VarChar(16)
>   chat    Chat    @relation(fields: [id_chat], references: [id_chat], onDelete: Cascade)
>   usuario Usuario @relation(fields: [id_usuario], references: [id_usuario], onDelete: Cascade)
>   @@id([id_chat, id_usuario, emoji])
> }
> ```
>
> A **confirmação de leitura** usa a `ChatLeitura` que **já existe** no schema
> (grava `lido_em` por `(id_chat, id_usuario)`). O `POST .../chat/lido` deve
> inserir/atualizar uma linha por mensagem ainda não lida pelo logado.

> 💡 **Busca** e **não-lidas** são derivadas no front a partir da lista — não
> precisam de rota própria (mas, se o volume crescer, um `?busca=` e um
> `GET /eventos/:id/chat/nao-lidas` ajudariam).

---

### 4.6 Mapas / Locais (de um evento) — 🆕 ENTIDADE NOVA

Qualquer participante pode adicionar um ou mais **locais** (link do Google Maps)
ao evento, para todos saberem onde será. Espelha a lógica da galeria/músicas:
cada local tem um dono; o **dono do local OU o organizador** do evento pode
remover.

> 🟥 **Não existe no schema.** Precisa de um model novo (ex.: `Local`).
> Sugestão no §5.

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/eventos/:id/locais` | lista os locais do evento |
| `POST` | `/eventos/:id/locais` | adiciona local (dono = logado) |
| `DELETE` | `/locais/:idLocal` | remove local (dono do local ou organizador) |

**Body do POST:**

```json
{ "nome": "Entrada principal", "link_maps": "https://maps.app.goo.gl/..." }
```

**Response do GET — lista:**

```json
[
  {
    "id_local": "uuid",
    "nome": "Entrada principal",
    "link_maps": "https://maps.app.goo.gl/...",
    "id_usuario": "uuid-dono"
  }
]
```

> 💡 O front **deriva sozinho** a URL de incorporação (embed) do mapa a partir
> do `link_maps`. Vocês só precisam guardar o link que o usuário colou (mais o
> `nome`, opcional). **Não precisam gerar embed nem usar API paga do Google.**

> 🆕 **Waze além do Google Maps.** Agora o usuário escolhe **Google Maps ou
> Waze** ao adicionar um local, e cola o link do app escolhido. Para o backend
> **muda quase nada**: continua sendo só um `link_maps` salvo. Se quiserem, dá
> pra guardar um campo opcional `provedor` (`"google"` | `"waze"`), mas **não é
> obrigatório** — o front consegue re-deduzir isso pelo próprio link. (Curiosidade:
> quando o link do Waze não tem coordenadas, o front geocodifica o endereço via
> Nominatim/OpenStreetMap **no navegador**, sem custo pro backend.)

---

### 4.7 Perfil — campos extras do usuário 🆕

A tela de perfil ganhou personalização (estilo Instagram/Facebook). No
`PUT /usuarios/:id` (que **já existe**), o front passa a enviar, além de
`nome / username / email / telefone / foto_perfil`, estes campos:

```json
{
  "bio": "Texto livre de apresentação",
  "foto_capa": "https://...  (imagem de capa do perfil)",
  "localizacao": "Cidade, Estado",
  "site": "https://meusite.com"
}
```

E o `GET /usuarios/:id` deve devolvê-los de volta.

> 🟥 **Colunas novas em `Usuario`.** Não existem `bio`, `foto_capa`,
> `localizacao` nem `site`. Sugestão no §5. Enquanto não existirem, o front
> guarda esses campos localmente (o perfil funciona, mas não sincroniza entre
> dispositivos).

---

### 4.8 Grupo do chat (de um evento) — 🆕 ENTIDADE NOVA

Cada evento agora tem um **grupo** (estilo WhatsApp): é a camada social do chat.
O front tem uma página de **gerenciamento do grupo** (`/eventos/:id/grupo`) com:

- **Nome do grupo** — próprio, pode ser **diferente** do título do evento (cai
  para o título se ninguém personalizar).
- **Descrição** do grupo.
- **Foto** do grupo (avatar).
- **Papel de parede** do chat — **compartilhado**: todos os participantes veem o
  mesmo. O valor é um id de predefinição (ex.: `"oceano"`) **ou** uma imagem
  (URL/data URL).
- **Admins** — quem pode gerenciar (ver regras abaixo).

**Regras de permissão (o front já aplica isso):**

| Ação | Quem pode |
|---|---|
| Nomear / remover **admin** | só o **criador** do evento (organizador) |
| Adicionar / remover **participante** | qualquer **admin** (criador + promovidos) |
| Editar **nome / descrição / foto** do grupo | qualquer **admin** |
| Trocar **papel de parede** | **qualquer participante** (é cosmético/compartilhado) |

> O **criador** (papel `organizador`) é **sempre admin** e é o **único** que
> nomeia outros admins.

**Rotas:**

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/eventos/:id/grupo` | config do grupo (nome, descrição, foto, papel de parede) |
| `PUT` | `/eventos/:id/grupo` | edita nome/descrição/foto (só admin) |
| `PUT` | `/eventos/:id/grupo/papel-parede` | troca o papel de parede (qualquer participante) |
| `POST` | `/eventos/:id/participantes/:idUsuario/admin` | promove a admin (só o criador) |
| `DELETE` | `/eventos/:id/participantes/:idUsuario/admin` | rebaixa de admin (só o criador) |

> As rotas de **adicionar/remover participante** já estão no §4.2 (agora só
> **admins** podem). A config do grupo também pode vir embutida no
> `GET /eventos/:id` em vez de uma rota separada — tanto faz pro front.

**Response do GET `/eventos/:id/grupo`:**

```json
{
  "nome_grupo": "Galera do Show",
  "descricao_grupo": "Só avisos importantes por aqui.",
  "foto_grupo": "https://... (ou data URL)",
  "papel_parede": "oceano"
}
```

**Body do PUT `/eventos/:id/grupo`:** os campos que mudaram, ex.:
`{ "nome_grupo": "Galera do Show", "descricao_grupo": "...", "foto_grupo": "..." }`

**Body do PUT `.../grupo/papel-parede`:** `{ "papel_parede": "oceano" }`

> 🟥 **Faltam no schema.** O jeito mais simples é adicionar colunas no `Evento`:
>
> ```prisma
> model Evento {
>   // ...campos existentes...
>   nome_grupo      String? @db.VarChar(150)
>   descricao_grupo String? @db.Text
>   foto_grupo      String? @db.VarChar(500)   // ou @db.Text se guardar data URL
>   papel_parede    String? @db.VarChar(500)
> }
> ```
>
> E o campo de **admin** na tabela `Participantes`:
>
> ```prisma
> model Participantes {
>   // ...campos existentes...
>   admin Boolean @default(false)   // criador (papel organizador) conta como admin sempre
> }
> ```
>
> (Alternativa: um model `Grupo` 1‑para‑1 com `Evento`. Mas colunas no `Evento`
> resolvem e são mais simples.)

---

## 5. 🟥 Resumo das lacunas no schema

Para o front funcionar 100%, faltam estes campos/tabelas:

| # | O que falta | Onde | Sugestão |
|---|---|---|---|
| 1 | `tipo`, `capa_url` e `data_hora_fim` do evento | model `Evento` | 3 colunas (§4.1) |
| 2 | Playlist principal do evento | model `Evento` | coluna `playlist_spotify String? @db.VarChar(500)` |
| 3 | **Locais do evento (mapas)** | model **novo** `Local` | id_evento, id_usuario, nome, link_maps |
| 4 | Campos do perfil | model `Usuario` | `bio`, `foto_capa`, `localizacao`, `site` |
| 5 | Votos de música (quem votou) | model novo | `MusicaVoto(id_musica, id_usuario)` PK composta |
| 6 | Curtidas de foto (quem curtiu) | model novo | `GaleriaCurtida(id_foto, id_usuario)` PK composta |
| 7 | Chat "recheado" (imagem, **áudio**, edição, apagar, resposta) | model `Chat` | colunas `imagem_url`, `audio_url`, `duracao`, `editado_em`, `excluido`, `responder_a` + valor `audio` no enum `TipoChat` (ver §4.5) |
| 8 | Reações de mensagem (emoji) | model novo | `ChatReacao(id_chat, id_usuario, emoji)` PK composta (ver §4.5) |
| 9 | **Grupo do chat** (nome, descrição, foto, papel de parede) | model `Evento` | colunas `nome_grupo`, `descricao_grupo`, `foto_grupo`, `papel_parede` (ver §4.8) |
| 10 | **Admins do grupo** | model `Participantes` | coluna `admin Boolean @default(false)` (ver §4.8) |

Exemplos das tabelas/colunas novas:

```prisma
// (3) Locais do evento — para os mapas
model Local {
  id_local   String   @id @default(uuid()) @db.Char(36)
  nome       String?  @db.VarChar(150)
  link_maps  String   @db.VarChar(500)
  criado_em  DateTime @default(now())

  id_evento  String
  id_usuario String

  evento  Evento  @relation(fields: [id_evento], references: [id_evento], onDelete: Cascade)
  usuario Usuario @relation(fields: [id_usuario], references: [id_usuario], onDelete: Cascade)

  @@index([id_evento])
}

// (4) Campos extras do perfil — adicionar em Usuario
model Usuario {
  // ...campos existentes...
  bio          String?  @db.Text
  foto_capa    String?  @db.VarChar(500)
  localizacao  String?  @db.VarChar(150)
  site         String?  @db.VarChar(255)
}

// (5) Votos de música
model MusicaVoto {
  id_musica  String
  id_usuario String
  musica  Musica  @relation(fields: [id_musica], references: [id_musica], onDelete: Cascade)
  usuario Usuario @relation(fields: [id_usuario], references: [id_usuario], onDelete: Cascade)
  @@id([id_musica, id_usuario])
}

// (6) Curtidas de foto
model GaleriaCurtida {
  id_foto    String
  id_usuario String
  foto    Galeria @relation(fields: [id_foto], references: [id_foto], onDelete: Cascade)
  usuario Usuario @relation(fields: [id_usuario], references: [id_usuario], onDelete: Cascade)
  @@id([id_foto, id_usuario])
}
```

> Os exemplos Prisma dos itens **7 a 10** (colunas do `Chat`, `ChatReacao`,
> colunas de grupo no `Evento` e `admin` em `Participantes`) estão nas seções
> **§4.5** e **§4.8**, junto das rotas.

> **Prioridade:** os itens **1, 2 e 3** destravam evento + playlist + mapas (o
> núcleo do app). Os itens **4 a 10** são refinamentos — sem eles o front
> continua funcionando (esses dados ficam só no navegador), mas não são
> compartilhados entre usuários. Dentro do chat, a ordem natural é: mensagens
> básicas → imagem/áudio → resposta/edição/apagar → reações → leitura ("visto")
> → grupo (nome/foto/admins).

---

## 6. Ordem sugerida de implementação

Do mais simples/independente para o mais complexo:

1. **Eventos** (CRUD) — desbloqueia quase tudo. *(+ colunas `tipo`, `capa_url`, `data_hora_fim`, `playlist_spotify`)*
2. **Participantes** — entrar/sair de evento *(+ coluna `admin` e as regras de admin do §4.8)*.
3. **Galeria** — listar/adicionar/remover fotos.
4. **Mapas / Locais** — *(+ tabela nova `Local`)*.
5. **Playlist do evento + Músicas** — playlist principal + lista colaborativa *(+ tabela de votos, se quiserem persistir)*.
6. **Chat** — comece pelo básico (listar/enviar) e vá somando: imagem/áudio → responder/editar/apagar → reações → leitura → **grupo** (nome/descrição/foto/papel de parede/admins, §4.8). *(+ colunas do `Chat`, `ChatReacao` e colunas de grupo no `Evento`)*
7. **Perfil** — colunas extras no `Usuario` (bio, foto_capa, localizacao, site).

Cada bloco que vocês entregarem, a gente vira a flag `USE_API.<entidade>`
para `true` e testa. Sem retrabalho, sem quebrar o que já funciona.

---

## 7. Padrão de código (só como referência)

Sigam o mesmo padrão que já usam em `usuarioController.js` /
`usuarioRouter.js`: um `Router` por entidade, um `controller` com as funções,
`try/catch` com `res.status(...).json(...)`, e Prisma para o banco. Se
seguirem os formatos de JSON deste documento, o frontend liga sem ajustes.
</content>
