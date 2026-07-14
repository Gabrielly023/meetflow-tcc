-- CreateTable
CREATE TABLE `Local` (
    `id_local` CHAR(36) NOT NULL,
    `nome` VARCHAR(150) NULL,
    `link_maps` VARCHAR(500) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_evento` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,

    INDEX `Local_id_evento_idx`(`id_evento`),
    PRIMARY KEY (`id_local`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Local` ADD CONSTRAINT `Local_id_evento_fkey` FOREIGN KEY (`id_evento`) REFERENCES `Evento`(`id_evento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Local` ADD CONSTRAINT `Local_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
