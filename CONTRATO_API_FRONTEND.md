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

## 🆕 Novidades desta versão

O frontend evoluiu bastante. Em relação à versão anterior deste contrato, foi
acrescentado:

- **Evento — horário de término** (`data_hora_fim`): novo campo opcional (§4.1).
- **Playlist principal do evento** (§4.4): além da lista colaborativa de
  músicas, cada evento tem **uma playlist** (embed do Spotify) — precisa de rota
  + 1 coluna.
- **Mapas do evento** (§4.6): entidade **nova**. Qualquer participante cola um
  link do Google Maps para marcar onde o evento será — precisa de tabela nova.
- **Perfil — campos extras** (§4.7): `bio`, `foto_capa`, `localizacao`, `site`.

> O resto que fizemos (criar evento já com mapa/playlist, ordenar tudo por data,
> editar qualquer evento) é **lógica de frontend** e não muda a API.

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
| `POST` | `/eventos/:id/participantes` | entrar no evento (com `senha_acesso`) |
| `DELETE` | `/eventos/:id/participantes/me` | o logado **sai** do evento |

**Response do GET — lista:**

```json
[
  { "id_usuario": "uuid", "nome": "Ana", "papel": "convidado", "status": "confirmado" }
]
```

> O front hoje mostra participantes como `{ id, name }`. O `nome` precisa vir
> do **join** com a tabela `usuario` (a tabela `Participantes` só tem os ids).

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

### 4.5 Chat (de um evento)

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/eventos/:id/chat` | lista as mensagens do evento |
| `POST` | `/eventos/:id/chat` | envia mensagem (autor = logado) |

**Body do POST:**

```json
{ "conteudo": "Texto da mensagem", "tipo": "mensagem" }
```

**Response do GET — lista:**

```json
[
  {
    "id_chat": "uuid",
    "conteudo": "A banda confirmou o set list?",
    "tipo": "mensagem",
    "criado_em": "2026-07-01T12:00:00.000Z",
    "id_usuario": "uuid-autor",
    "autor_nome": "Ana"
  }
]
```

> O `autor_nome` precisa vir do **join** com `usuario` — o front exibe o nome
> de quem mandou a mensagem.

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

> Prioridade: os itens **1, 2 e 3** destravam evento + playlist + mapas (o
> núcleo do app). Os itens **4, 5 e 6** são refinamentos — sem eles o front
> continua funcionando (esses dados ficam só no navegador), mas não são
> compartilhados entre usuários.

---

## 6. Ordem sugerida de implementação

Do mais simples/independente para o mais complexo:

1. **Eventos** (CRUD) — desbloqueia quase tudo. *(+ colunas `tipo`, `capa_url`, `data_hora_fim`, `playlist_spotify`)*
2. **Participantes** — entrar/sair de evento.
3. **Galeria** — listar/adicionar/remover fotos.
4. **Mapas / Locais** — *(+ tabela nova `Local`)*.
5. **Playlist do evento + Músicas** — playlist principal + lista colaborativa *(+ tabela de votos, se quiserem persistir)*.
6. **Chat** — mensagens do evento.
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
