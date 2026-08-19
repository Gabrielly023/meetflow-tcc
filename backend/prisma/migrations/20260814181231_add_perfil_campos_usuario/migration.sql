-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `foto_capa` VARCHAR(500) NULL,
    ADD COLUMN `localizacao` VARCHAR(150) NULL,
    ADD COLUMN `site` VARCHAR(255) NULL;
