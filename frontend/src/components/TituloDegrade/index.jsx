// Renderiza um título com a "regra do degradê": todas as palavras em branco,
// só a última (a palavra-chave do nome) recebe o degradê do header.
// Uso: <h1 className="text-4xl ..."><TituloDegrade texto={evento.titulo} /></h1>
export default function TituloDegrade({ texto }) {
  const palavras = String(texto ?? "").trim().split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return null;

  const ultima = palavras.pop();
  const inicio = palavras.join(" ");

  return (
    <>
      {inicio && `${inicio} `}
      <span className="texto-gradiente">{ultima}</span>
    </>
  );
}
