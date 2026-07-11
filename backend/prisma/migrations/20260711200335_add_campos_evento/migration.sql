-- AlterTable
ALTER TABLE `evento` ADD COLUMN `capa_url` VARCHAR(500) NULL,
    ADD COLUMN `data_hora_fim` DATETIME(3) NULL,
    ADD COLUMN `playlist_spotify` VARCHAR(500) NULL,
    ADD COLUMN `tipo` VARCHAR(50) NULL;
