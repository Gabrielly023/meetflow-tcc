import sanitizeHtml from "sanitize-html";

// Remove qualquer tag HTML/script de um texto livre (descrição, bio, nome, etc.)
export function sanitizarTexto(texto) {
  if (typeof texto !== "string") return texto;

  return sanitizeHtml(texto, {
    allowedTags: [],       // não permite nenhuma tag HTML
    allowedAttributes: {}, // não permite nenhum atributo
  }).trim();
}