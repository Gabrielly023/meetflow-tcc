-- CreateTable
CREATE TABLE `MusicaVoto` (
    `id_musica` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_musica`, `id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MusicaVoto` ADD CONSTRAINT `MusicaVoto_id_musica_fkey` FOREIGN KEY (`id_musica`) REFERENCES `Musica`(`id_musica`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MusicaVoto` ADD CONSTRAINT `MusicaVoto_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
