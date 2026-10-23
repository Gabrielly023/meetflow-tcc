import { prisma } from "../config/db.js";

// Verifica se o usuário é admin daquele evento (organizador OU promovido)
async function ehAdmin(id_evento, id_usuario) {
  const participacao = await prisma.participantes.findUnique({
    where: { id_evento_id_usuario: { id_evento, id_usuario } },
  });
  return !!participacao?.admin;
}

const participanteController = {

  // LISTAR PARTICIPANTES DE UM EVENTO
  async listar(req, res) {
    try {
      const { id } = req.params; // id_evento
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      const souParticipante = await prisma.participantes.findUnique({
        where: { id_evento_id_usuario: { id_evento: id, id_usuario } },
      });

      if (!souParticipante) {
        return res.status(403).json({ mensagem: "Você não tem acesso a este evento." });
      }

      const participantes = await prisma.participantes.findMany({
        where: { id_evento: id },
        include: {
          usuario: { select: { id_usuario: true, nome: true } },
        },
      });

      const resposta = participantes.map((p) => ({
        id_usuario: p.usuario.id_usuario,
        nome: p.usuario.nome,
        papel: p.papel,
        status: p.status,
        admin: p.admin,
      }));

      res.json(resposta);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao listar participantes." });
    }
  },

  // ADICIONAR PARTICIPANTE
  // - Se vier "senha_acesso": o próprio logado está entrando no evento
  // - Se vier "username": um admin está adicionando outra pessoa
  async adicionar(req, res) {
    try {
      const { id } = req.params; // id_evento
      const { id_usuario } = req.usuario; // quem está fazendo a requisição
      const { senha_acesso, username } = req.body;

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }
      
      if (username) {
        const souAdmin = await ehAdmin(id, id_usuario);
        
        if (!souAdmin) {
          return res.status(403).json({
            mensagem: "Apenas admins podem adicionar participantes.",
          });
        }
        
        const usuarioAlvo = await prisma.usuario.findUnique({
          where: { username },
        });
        
        if (!usuarioAlvo) {
          return res.status(404).json({
            mensagem: "Usuário não encontrado.",
          });
        }
        
        const jaParticipa = await prisma.participantes.findUnique({
          where: {
            id_evento_id_usuario: {
              id_evento: id,
              id_usuario: usuarioAlvo.id_usuario,
            },
          },
        });
        
        if (jaParticipa) {
          return res.status(409).json({
            mensagem: "Esse usuário já participa deste evento.",
          });
        }
        
        const novoParticipante = await prisma.participantes.create({
          data: {
            id_evento: id,
            id_usuario: usuarioAlvo.id_usuario,
            papel: "convidado",
            status: "pendente",
          },
        });
        
        return res.status(201).json({
          mensagem: "Convite enviado com sucesso.",
          convite: novoParticipante,
        });
      }

      // Eventos sem senha são abertos; os demais exigem a senha correta.
      if (evento.senha_acesso && senha_acesso !== evento.senha_acesso) {
        return res.status(401).json({ mensagem: "Senha de acesso incorreta." });
      }

      const jaParticipa = await prisma.participantes.findUnique({
        where: { id_evento_id_usuario: { id_evento: id, id_usuario } },
      });
      if (jaParticipa) {
        return res.status(409).json({ mensagem: "Você já participa deste evento." });
      }

      const novoParticipante = await prisma.participantes.create({
        data: { id_evento: id, id_usuario, papel: "convidado", status: "confirmado" },
      });

      return res.status(201).json(novoParticipante);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao adicionar participante." });
    }
  },

  
async aceitarConvite(req, res) {
  try {
    const { id } = req.params;
    const { id_usuario } = req.usuario;

    const participacao = await prisma.participantes.findUnique({
      where: {
        id_evento_id_usuario: {
          id_evento: id,
          id_usuario,
        },
      },
    });

    if (!participacao || participacao.status !== "pendente") {
      return res.status(404).json({
        mensagem: "Convite pendente não encontrado.",
      });
    }

    const atualizada = await prisma.participantes.update({
      where: {
        id_evento_id_usuario: {
          id_evento: id,
          id_usuario,
        },
      },
      data: {
        status: "confirmado",
      },
    });

    return res.status(200).json({
      mensagem: "Convite aceito com sucesso!",
      participacao: atualizada,
    });
  } catch (error) {
    console.error("Erro ao aceitar convite:", error);
    return res.status(500).json({
      mensagem: "Erro ao aceitar o convite.",
    });
  }
},


async recusarConvite(req, res) {
  try {
    const { id } = req.params;
    const { id_usuario } = req.usuario;

    const participacao = await prisma.participantes.findUnique({
      where: {
        id_evento_id_usuario: {
          id_evento: id,
          id_usuario,
        },
      },
    });

    if (!participacao || participacao.status !== "pendente") {
      return res.status(404).json({
        mensagem: "Convite pendente não encontrado.",
      });
    }

    const atualizada = await prisma.participantes.update({
      where: {
        id_evento_id_usuario: {
          id_evento: id,
          id_usuario,
        },
      },
      data: {
        status: "recusado",
      },
    });

    return res.status(200).json({
      mensagem: "Convite recusado.",
      participacao: atualizada,
    });
  } catch (error) {
    console.error("Erro ao recusar convite:", error);
    return res.status(500).json({
      mensagem: "Erro ao recusar o convite.",
    });
  }
},


  // O PRÓPRIO LOGADO SAI DO EVENTO
  async sair(req, res) {
    try {
      const { id } = req.params; // id_evento
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (evento.id_usuario === id_usuario) {
        return res.status(400).json({
          mensagem: "O organizador não pode sair do próprio evento. Exclua o evento se desejar.",
        });
      }

      await prisma.participantes.delete({
        where: { id_evento_id_usuario: { id_evento: id, id_usuario } },
      });

      res.json({ mensagem: "Você saiu do evento." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao sair do evento." });
    }
  },
  
  async listarConvites(req, res) {
    try {
      const { id_usuario } = req.usuario;
      
      const convites = await prisma.participantes.findMany({
        where: {
          id_usuario,
          status: "pendente",
        },
        include: {
          evento: true,
          usuario: {
            select: {
              id_usuario: true,
              nome: true,
            },
          },
        },
        orderBy: {
          id_evento: "asc",
        },
      });
      
      return res.json(convites);
    } catch (error) {
      console.error("Erro ao listar convites:", error);
      return res.status(500).json({
        mensagem: "Erro ao listar convites pendentes.",
      });
    }
  },


  // ADMIN REMOVE UM PARTICIPANTE (não deleta o Usuario, só a participação)
  async remover(req, res) {
    try {
      const { id, idUsuario } = req.params; // id_evento, id do participante a remover
      const { id_usuario } = req.usuario; // quem está removendo

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      const souAdmin = await ehAdmin(id, id_usuario);
      if (!souAdmin) {
        return res.status(403).json({ mensagem: "Apenas admins podem remover participantes." });
      }

      if (evento.id_usuario === idUsuario) {
        return res.status(400).json({ mensagem: "O organizador não pode ser removido." });
      }

      await prisma.participantes.delete({
        where: { id_evento_id_usuario: { id_evento: id, id_usuario: idUsuario } },
      });

      res.json({ mensagem: "Participante removido com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao remover participante." });
    }
  },

  // PROMOVER A ADMIN (só o criador do evento)
  async promoverAdmin(req, res) {
    try {
      const { id, idUsuario } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (evento.id_usuario !== id_usuario) {
        return res.status(403).json({ mensagem: "Apenas o criador do evento pode nomear admins." });
      }

      const participante = await prisma.participantes.update({
        where: { id_evento_id_usuario: { id_evento: id, id_usuario: idUsuario } },
        data: { admin: true },
      });

      res.json(participante);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao promover participante a admin." });
    }
  },

  // REBAIXAR DE ADMIN (só o criador do evento)
  async rebaixarAdmin(req, res) {
    try {
      const { id, idUsuario } = req.params;
      const { id_usuario } = req.usuario;

      const evento = await prisma.evento.findUnique({ where: { id_evento: id } });
      if (!evento) {
        return res.status(404).json({ mensagem: "Evento não encontrado." });
      }

      if (evento.id_usuario !== id_usuario) {
        return res.status(403).json({ mensagem: "Apenas o criador do evento pode remover admins." });
      }

      if (evento.id_usuario === idUsuario) {
        return res.status(400).json({ mensagem: "O criador do evento sempre é admin." });
      }

      const participante = await prisma.participantes.update({
        where: { id_evento_id_usuario: { id_evento: id, id_usuario: idUsuario } },
        data: { admin: false },
      });

      res.json(participante);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao rebaixar admin." });
    }
  },
};

export default participanteController;