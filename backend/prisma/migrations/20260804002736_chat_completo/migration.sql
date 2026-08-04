-- AlterTable
ALTER TABLE `chat` ADD COLUMN `audio_url` VARCHAR(500) NULL,
    ADD COLUMN `duracao` INTEGER NULL,
    ADD COLUMN `editado_em` DATETIME(3) NULL,
    ADD COLUMN `excluido` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `imagem_url` VARCHAR(500) NULL,
    ADD COLUMN `responder_a` VARCHAR(191) NULL,
    MODIFY `tipo` ENUM('mensagem', 'imagem', 'audio', 'sistema') NOT NULL DEFAULT 'mensagem';

-- CreateTable
CREATE TABLE `ChatReacao` (
    `id_chat` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `emoji` VARCHAR(16) NOT NULL,

    PRIMARY KEY (`id_chat`, `id_usuario`, `emoji`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_responder_a_fkey` FOREIGN KEY (`responder_a`) REFERENCES `Chat`(`id_chat`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatReacao` ADD CONSTRAINT `ChatReacao_id_chat_fkey` FOREIGN KEY (`id_chat`) REFERENCES `Chat`(`id_chat`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatReacao` ADD CONSTRAINT `ChatReacao_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
