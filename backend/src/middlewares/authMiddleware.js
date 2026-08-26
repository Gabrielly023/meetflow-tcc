import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {

  // 1. Pega o cabeçalho "Authorization" da requisição
  const authHeader = req.headers.authorization;

  // Se não veio nenhum header, barra a entrada
  if (!authHeader) {
    return res.status(401).json({ mensagem: "Token não fornecido." });
  }

  // 2. O header vem no formato "Bearer eyJhbGciOi..."
  // Isso separa em duas partes: ["Bearer", "eyJhbGciOi..."]
  const partes = authHeader.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({ mensagem: "Token mal formatado." });
  }

 const token = partes[1];
  try {
    // 3. Verifica se o token é válido e não expirou,
    // usando a mesma chave secreta usada para criá-lo no login
    const dadosDoToken = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Gruda os dados do usuário na requisição,
    // para os controllers poderem usar depois
    req.usuario = dadosDoToken; // { id_usuario, username }

    // 5. Deixa a requisição seguir para o controller
    next();

  } catch (error) {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
}
}

export default authMiddleware;