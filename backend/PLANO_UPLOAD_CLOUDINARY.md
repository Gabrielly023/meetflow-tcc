# Upload de imagens com Cloudinary no backend

## Resumo e diagnóstico

Branch de trabalho: `feat/backend-cloudinary-upload`, criada a partir da `main`.

Implementar upload para galeria, perfil, capa do usuário, capa do evento, foto do grupo, papel de parede compartilhado e imagens do chat. Migrar as fotos locais existentes. A integração das telas fica fora desta entrega.

Hoje, apenas a galeria recebe arquivos via Multer, salvando em disco. O schema já possui os principais campos de URL, mas falta identificar os arquivos no Cloudinary para gerenciar substituições e exclusões. Foto do grupo e papel de parede atualmente sobrescrevem a capa do evento.

## Estrutura do banco

Alterar `backend/prisma/schema.prisma` com uma migration aditiva:

| Modelo | Alterações |
|---|---|
| `Usuario` | Adicionar `foto_perfil_public_id` e `foto_capa_public_id`. |
| `Evento` | Adicionar `capa_public_id`, `foto_grupo_url`, `foto_grupo_public_id`, `papel_parede_url` e `papel_parede_public_id`. |
| `Galeria` | Adicionar `foto_public_id`. |
| `Chat` | Adicionar `imagem_public_id`; reutilizar `imagem_url` e `tipo = imagem`. |

- Novos campos serão opcionais, preservando registros existentes. Usar `VarChar(255)` para identificadores e ampliar URLs de imagens para `VarChar(2048)`.
- Manter `Galeria.url_foto` opcional no banco nesta etapa, mas exigir arquivo nas novas inclusões.
- Inicializar foto do grupo e papel de parede com a capa atual, preservando a aparência existente; futuras alterações serão independentes.
- Adicionar uma tabela `MidiaExclusaoPendente`, sem exclusão em cascata, com identificador, `public_id` único, tentativas, próxima tentativa, último erro e data de criação. Ela permitirá repetir exclusões que falharem no Cloudinary.

## Upload e contratos da API

Usar o SDK oficial `cloudinary`, Multer em memória e `upload_stream`; persistir `secure_url` e `public_id` retornados pelo serviço. A exclusão utilizará `destroy` com invalidação de cache. Referência: [documentação oficial do Cloudinary](https://cloudinary.com/documentation/node_image_and_video_upload).

Todos os uploads receberão `multipart/form-data`, com um arquivo no campo `foto`:

| Operação | Endpoint |
|---|---|
| Adicionar foto à galeria | `POST /eventos/:id/galeria`, preservando a rota atual |
| Substituir foto de perfil | `PUT /usuarios/:id/foto-perfil` |
| Substituir capa do usuário | `PUT /usuarios/:id/foto-capa` |
| Substituir capa do evento | `PUT /eventos/:id/capa` |
| Substituir foto do grupo | `PUT /eventos/:id/grupo/foto` |
| Substituir papel de parede | `PUT /eventos/:id/grupo/papel-parede` |
| Enviar imagem no chat | Adaptar os dois endpoints atuais de envio para aceitar multipart, preservando mensagens JSON |

- Oferecer `DELETE` nas rotas de perfil e capas/grupo para remover a imagem. Galeria e chat reutilizarão suas exclusões atuais.
- Retornar os campos públicos de URL correspondentes; identificadores do Cloudinary permanecerão internos. Chat incluirá `imagem_url` na resposta e listagem, permitindo imagem sem legenda e mantendo `responder_a`.
- Autenticar e autorizar antes de processar arquivos: usuário edita suas imagens; organizador edita capa; organizador ou administrador edita foto do grupo; organizador ou participante confirmado envia galeria/chat e altera papel de parede. Bloquear novos uploads em eventos na lixeira.
- Aceitar JPEG, PNG e WebP, até 5 MB, validando assinatura do arquivo além do MIME. Rejeitar arquivo ausente ou inválido com `400`, excesso de tamanho com `413` e falha do provedor com `502`.
- Gerar identificadores únicos no servidor, separados por ambiente e finalidade. Credenciais ficarão exclusivamente no backend, documentadas em `.env.example`.
- Preservar atualizações JSON com URLs externas válidas, sem baixá-las automaticamente. Ao substituir uma imagem gerenciada por URL externa ou removê-la, limpar seu identificador e agendar a exclusão anterior. Reenvio da mesma URL preservará o identificador.

## Consistência, exclusão e migração

- Enviar a nova imagem antes de atualizar o banco. Se a persistência falhar, excluir o upload recém-criado; registrar a limpeza pendente caso essa compensação falhe.
- Gravar a alteração de referência e a tarefa de exclusão anterior na mesma transação. Processar exclusões após o commit, com repetição persistente e logs, sem manter transações abertas durante chamadas ao Cloudinary.
- Cobrir exclusão individual, exclusão de usuário, exclusão permanente de evento e limpeza automática após 30 dias. Coletar imagens dos registros afetados antes das cascatas; preservar imagens enquanto o evento estiver na lixeira.
- Antes de destruir um arquivo, verificar se algum registro ainda referencia seu `public_id`, inclusive imagens compartilhadas pelo preenchimento inicial.
- Criar script de migração com simulação e execução explícita: localizar referências locais no banco, validar caminhos dentro de `uploads`, enviar arquivos e atualizar URL/identificador somente após sucesso.
- Tornar o script retomável, usando identificadores determinísticos e ignorando registros já migrados. Reportar arquivos ausentes, falhas e arquivos sem referência; não apagar os originais.
- Manter `/uploads` durante a transição. Executar a migração em janela sem escritas, após backup do banco e arquivos; preservar URLs externas, incluindo imagens do Google.

## Validação e entrega

- Configurar `npm test` com `node:test`, preservando os testes existentes e simulando Cloudinary nos testes automatizados.
- Cobrir upload em cada finalidade, autorização, evento excluído, formatos inválidos, limite de tamanho e falhas do provedor/banco.
- Validar substituições concorrentes, exclusões em cascata, repetição da limpeza e preservação de imagens ainda referenciadas.
- Testar chat sem legenda, listagem de imagens e compatibilidade das mensagens JSON; confirmar independência entre capa, foto do grupo e papel de parede.
- Validar migration Prisma, preenchimento inicial e retomada da migração de arquivos, incluindo arquivos ausentes.
- Documentar variáveis, endpoints, exemplos de requisição, comandos de migração e operação da limpeza. Fazer teste real de upload, leitura, substituição e exclusão em ambiente de desenvolvimento com credenciais configuradas.

**Premissas:** entrega restrita ao backend; áudio e vídeo fora do escopo; URLs de imagens acessíveis por link, sem implementar mídia privada assinada nesta etapa.
