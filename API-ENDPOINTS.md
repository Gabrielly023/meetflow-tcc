# 📌 API MEETFLOW - Endpoints

## 🔗 Base URL
```
http://localhost:3000
```

---

## 👥 Endpoints de Usuário

### 1️⃣ **GET - Listar todos os usuários**
```http
GET /usuarios
```
**Response:**
```json
[
  {
    "id_usuario": "uuid-123",
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "criptografada",
    "foto_perfil": "https://..."
  }
]
```

---

### 2️⃣ **GET - Buscar usuário por ID**
```http
GET /usuarios/:id
```
**Parâmetro:** `id` = ID do usuário (uuid)

**Response:**
```json
{
  "id_usuario": "uuid-123",
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "criptografada",
  "foto_perfil": "https://..."
}
```

---

### 3️⃣ **POST - Criar novo usuário**
```http
POST /usuarios
```
**Body (JSON):**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "foto_perfil": "https://i.pravatar.cc/150?img=1"
}
```
**Response (Status 201):**
```json
{
  "id_usuario": "uuid-123",
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "foto_perfil": "https://i.pravatar.cc/150?img=1"
}
```

---

### 4️⃣ **PUT - Atualizar usuário (todos os campos)**
```http
PUT /usuarios/:id
```
**Parâmetro:** `id` = ID do usuário

**Body (JSON):**
```json
{
  "nome": "João Silva Atualizado",
  "email": "joao.novo@email.com",
  "senha": "novaSenha123",
  "foto_perfil": "https://i.pravatar.cc/150?img=2"
}
```
**Response:**
```json
{
  "id_usuario": "uuid-123",
  "nome": "João Silva Atualizado",
  "email": "joao.novo@email.com",
  "senha": "novaSenha123",
  "foto_perfil": "https://i.pravatar.cc/150?img=2"
}
```

---

### 5️⃣ **DELETE - Deletar usuário**
```http
DELETE /usuarios/:id
```
**Parâmetro:** `id` = ID do usuário

**Response:**
```json
{
  "mensagem": "Usuário deletado com sucesso"
}
```

---

## 🎯 Como usar no Frontend (React com Fetch/Axios)

### Exemplo com Fetch API:

**GET - Listar:**
```javascript
fetch('http://localhost:3000/usuarios')
  .then(res => res.json())
  .then(data => console.log(data));
```

**POST - Criar:**
```javascript
fetch('http://localhost:3000/usuarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'João',
    email: 'joao@email.com',
    senha: '123456',
    foto_perfil: 'https://...'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

**PUT - Atualizar:**
```javascript
fetch('http://localhost:3000/usuarios/uuid-123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Novo Nome',
    email: 'novo@email.com',
    senha: '123456',
    foto_perfil: 'https://...'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

**DELETE:**
```javascript
fetch('http://localhost:3000/usuarios/uuid-123', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## ⚙️ Variáveis Importantes

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id_usuario` | String (UUID) | ✓ (Auto) | Gerado automaticamente |
| `nome` | String (até 100) | ✓ | Nome do usuário |
| `email` | String (até 100) | ✓ | Email único |
| `senha` | String (até 255) | ✓ | Senha do usuário |
| `foto_perfil` | String (até 500) | ✗ (Opcional) | URL da foto |

---

## 🚀 Status Códigos

| Código | Significado |
|--------|------------|
| **200** | Sucesso |
| **201** | Criado com sucesso |
| **400** | Erro na requisição |
| **404** | Não encontrado |
| **500** | Erro do servidor |

---

## 📝 Notas

- ✅ CORS está configurado para aceitar requisições do frontend
- ✅ Use **PUT** para atualizar (não use PATCH)
- ✅ O backend está rodando em `http://localhost:3000`
- ✅ O frontend deve estar em `http://localhost:5173` (padrão Vite)
