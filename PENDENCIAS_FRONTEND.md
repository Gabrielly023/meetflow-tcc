# MeetFlow — Pendências para o Frontend (11/07/2026)

> Este arquivo traz apenas o que a dupla do frontend precisa fazer agora: um bug reportado e os endpoints do backend que já estão prontos, testados, e aguardando integração.

---

## 🐞 Bug reportado: botão Home não funciona

**Erro na página de Login e Cadastro**

O botão/link "Home" não funciona quando o usuário está na página de Login ou na página de Cadastro — ele não navega de volta para a Home. Provavelmente um problema de rota no React Router DOM nessas duas telas específicas.

---

## ✅ Endpoints prontos para integração

Todos os itens abaixo estão implementados e testados no backend. Os formatos de payload/resposta seguem exatamente o que já foi especificado no contrato de API original enviado pela dupla do frontend — não estão repetidos aqui para evitar duplicação.

**Lembrete importante:** TODAS as rotas abaixo exigem o header:
```
Authorization: Bearer <token>
```
(o token vem do `POST /usuarios/login`, salvo no localStorage)

| Bloco | Rotas prontas |
|---|---|
| **Eventos** | `GET /eventos` · `GET /eventos/:id` · `POST /eventos` · `PUT /eventos/:id` · `DELETE /eventos/:id` |
| **Participantes** | `GET /eventos/:id/participantes` · `POST /eventos/:id/participantes` (via `senha_acesso` ou `username`) · `DELETE .../participantes/me` · `DELETE .../participantes/:idUsuario` · `POST`/`DELETE .../participantes/:idUsuario/admin` |
| **Galeria** | `GET /eventos/:id/galeria` · `POST /eventos/:id/galeria` · `DELETE /galeria/:idFoto` |
| **Mapas / Locais** | `GET /eventos/:id/locais` · `POST /eventos/:id/locais` · `DELETE /locais/:idLocal` |
| **Playlist do evento** | `PUT /eventos/:id/playlist` · `DELETE /eventos/:id/playlist` |
| **Músicas colaborativas** | `GET /eventos/:id/musicas` · `POST /eventos/:id/musicas` · `DELETE /musicas/:idMusica` · `POST /musicas/:idMusica/voto` |
| **Chat completo** | `GET /eventos/:id/chat` · `POST /eventos/:id/chat` · `PUT /chat/:idChat` · `DELETE /chat/:idChat` · `POST /chat/:idChat/reacao` · `POST /eventos/:id/chat/lido` |

⚠️ **Ainda NÃO implementado (não integrar ainda):** Grupo do chat (nome/descrição/foto/papel de parede) e campos extras de Perfil (`bio`, `foto_capa`, `localizacao`, `site`). Avisaremos aqui assim que estiverem prontos.

---

## 🆕 Novo: sistema de token renovável (refresh token)

**Mudou o formato da resposta do login.** O `POST /usuarios/login` agora devolve **dois tokens**, não um só:

```json
{
  "mensagem": "Login realizado com sucesso!",
  "usuario": { "...": "..." },
  "token": "eyJhbGc...",
  "refreshToken": "a1b2c3d4e5f6..."
}
```

- `token` (access token) — dura só **15 minutos**. É o mesmo de sempre, usado no header `Authorization: Bearer <token>`.
- `refreshToken` — dura **30 dias**. Não é usado em rotas normais, só serve para pedir um `token` novo quando o antigo expirar.

### Ação necessária no frontend (obrigatória)

1. **Salvar os dois tokens no login**, não só o `token`:
```javascript
localStorage.setItem("token", response.data.token);
localStorage.setItem("refreshToken", response.data.refreshToken);
```

2. **Configurar um interceptor no Axios** para renovar o token automaticamente quando uma requisição falhar com `401` (token expirado), sem precisar pedir login de novo ao usuário:

```javascript
// Quando uma requisição falha com 401, tenta renovar o token e repetir a requisição
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post("http://localhost:3000/usuarios/refresh-token", { refreshToken });

        localStorage.setItem("token", data.token);
        original.headers.Authorization = `Bearer ${data.token}`;

        return api(original); // repete a requisição original com o token novo
      } catch (erroRefresh) {
        // Refresh token também inválido/expirado -> desloga de vez
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
```

3. **Novo endpoint de renovação:** `POST /usuarios/refresh-token`
   - Body: `{ "refreshToken": "..." }`
   - Sucesso (`200`): `{ "token": "novo-access-token" }`
   - Erro (`401`): refresh token inválido ou expirado — nesse caso, deslogar o usuário de verdade (ele precisa fazer login novamente)

4. **Logout precisa mudar:** agora é necessário chamar o backend para revogar o refresh token, não só limpar o `localStorage`:
```javascript
await api.post("/usuarios/logout", { refreshToken: localStorage.getItem("refreshToken") });
localStorage.removeItem("token");
localStorage.removeItem("refreshToken");
```
   - Rota: `POST /usuarios/logout`
   - Body: `{ "refreshToken": "..." }`
   - Sucesso (`200`): `{ "mensagem": "Logout realizado com sucesso." }`
