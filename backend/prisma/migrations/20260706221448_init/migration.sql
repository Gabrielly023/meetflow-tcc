-- CreateTable
CREATE TABLE `usuario` (
    `id_usuario` CHAR(36) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `username` VARCHAR(30) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `foto_perfil` VARCHAR(500) NULL,

    UNIQUE INDEX `usuario_username_key`(`username`),
    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evento` (
    `id_evento` CHAR(36) NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `descricao` TEXT NULL,
    `data_hora` DATETIME(3) NOT NULL,
    `localizacao` VARCHAR(255) NULL,
    `senha_acesso` VARCHAR(255) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_evento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participantes` (
    `id_evento` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `status` ENUM('pendente', 'confirmado', 'recusado') NOT NULL DEFAULT 'confirmado',
    `papel` ENUM('organizador', 'convidado') NOT NULL DEFAULT 'convidado',

    PRIMARY KEY (`id_evento`, `id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Galeria` (
    `id_foto` CHAR(36) NOT NULL,
    `url_foto` VARCHAR(500) NULL,
    `postado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_evento` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_foto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Musica` (
    `id_musica` CHAR(36) NOT NULL,
    `titulo` VARCHAR(150) NULL,
    `link_spotify` VARCHAR(500) NOT NULL,
    `capa_url` VARCHAR(500) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_evento` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,

    INDEX `idx_musica_evento`(`id_evento`),
    PRIMARY KEY (`id_musica`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `id_chat` CHAR(36) NOT NULL,
    `conteudo` TEXT NULL,
    `tipo` ENUM('mensagem', 'imagem', 'sistema') NOT NULL DEFAULT 'mensagem',
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_evento` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,

    INDEX `idx_chat_evento_data`(`id_evento`, `criado_em`),
    PRIMARY KEY (`id_chat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatLeitura` (
    `id_chat` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `lido_em` DATETIME(3) NULL,

    PRIMARY KEY (`id_chat`, `id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Evento` ADD CONSTRAINT `Evento_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participantes` ADD CONSTRAINT `Participantes_id_evento_fkey` FOREIGN KEY (`id_evento`) REFERENCES `Evento`(`id_evento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participantes` ADD CONSTRAINT `Participantes_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Galeria` ADD CONSTRAINT `Galeria_id_evento_fkey` FOREIGN KEY (`id_evento`) REFERENCES `Evento`(`id_evento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Galeria` ADD CONSTRAINT `Galeria_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Musica` ADD CONSTRAINT `Musica_id_evento_fkey` FOREIGN KEY (`id_evento`) REFERENCES `Evento`(`id_evento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Musica` ADD CONSTRAINT `Musica_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_id_evento_fkey` FOREIGN KEY (`id_evento`) REFERENCES `Evento`(`id_evento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatLeitura` ADD CONSTRAINT `ChatLeitura_id_chat_fkey` FOREIGN KEY (`id_chat`) REFERENCES `Chat`(`id_chat`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatLeitura` ADD CONSTRAINT `ChatLeitura_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
