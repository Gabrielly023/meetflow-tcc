MeetFlow — Pendências para o Frontend (11/07/2026)

Este arquivo traz apenas o que a dupla do frontend precisa fazer agora: um bug reportado e os endpoints do backend que já estão prontos, testados, e aguardando integração.

🐞 Bug reportado: botão Home não funciona

Erro na página de Login e Cadastro

O botão/link "Home" não funciona quando o usuário está na página de Login ou na página de Cadastro — ele não navega de volta para a Home. Provavelmente um problema de rota no React Router DOM nessas duas telas específicas.

✅ Endpoints prontos para integração

Todos os itens abaixo estão implementados e testados no backend. Os formatos de payload/resposta seguem exatamente o que já foi especificado no contrato de API original enviado pela dupla do frontend — não estão repetidos aqui para evitar duplicação.

Lembrete importante: TODAS as rotas abaixo exigem o header:

Authorization: Bearer <token>

(o token vem do POST /usuarios/login, salvo no localStorage)

Bloco	Rotas prontas
Eventos	GET /eventos · GET /eventos/:id · POST /eventos · PUT /eventos/:id · DELETE /eventos/:id
Participantes	GET /eventos/:id/participantes · POST /eventos/:id/participantes (via senha_acesso ou username) · DELETE .../participantes/me · DELETE .../participantes/:idUsuario · POST/DELETE .../participantes/:idUsuario/admin
Galeria	GET /eventos/:id/galeria · POST /eventos/:id/galeria · DELETE /galeria/:idFoto
Mapas / Locais	GET /eventos/:id/locais · POST /eventos/:id/locais · DELETE /locais/:idLocal
Playlist do evento	PUT /eventos/:id/playlist · DELETE /eventos/:id/playlist
Músicas colaborativas	GET /eventos/:id/musicas · POST /eventos/:id/musicas · DELETE /musicas/:idMusica · POST /musicas/:idMusica/voto
Chat completo	GET /eventos/:id/chat · POST /eventos/:id/chat · PUT /chat/:idChat · DELETE /chat/:idChat · POST /chat/:idChat/reacao · POST /eventos/:id/chat/lido

⚠️ Ainda NÃO implementado (não integrar ainda): Grupo do chat (nome/descrição/foto/papel de parede) e campos extras de Perfil (bio, foto_capa, localizacao, site). Avisaremos aqui assim que estiverem prontos.