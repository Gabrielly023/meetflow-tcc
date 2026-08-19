-- CreateTable
CREATE TABLE `GaleriaCurtida` (
    `id_foto` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `curtido_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_foto`, `id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GaleriaCurtida` ADD CONSTRAINT `GaleriaCurtida_id_foto_fkey` FOREIGN KEY (`id_foto`) REFERENCES `Galeria`(`id_foto`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GaleriaCurtida` ADD CONSTRAINT `GaleriaCurtida_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
