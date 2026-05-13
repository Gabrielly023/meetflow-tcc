import express from "express";

import "./config/db.js";

const app = express();

app.use(express.json());

const PORT = 3306;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});