const API_URL = "http://localhost:3000/notificacoes"; // Ajuste a URL/porta da sua API se necessário

export async function buscarNotificacoesDoUsuario(usuarioId) {
  try {
    const resposta = await fetch(`${API_URL}/${usuarioId}`);
    if (!resposta.ok) throw new Error("Erro ao buscar notificações");
    return await resposta.json();
  } catch (error) {
    console.error("Erro no notificacaoService:", error);
    return [];
  }
}

export async function responderSolicitacaoApi(notificacaoId, aprovado) {
  try {
    const resposta = await fetch(`${API_URL}/${notificacaoId}/responder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aprovado }),
    });
    return resposta.ok;
  } catch (error) {
    console.error("Erro ao responder notificação:", error);
    return false;
  }
}