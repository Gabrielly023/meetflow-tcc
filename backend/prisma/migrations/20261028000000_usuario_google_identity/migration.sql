ALTER TABLE `usuario` ADD COLUMN `google_sub` VARCHAR(255) NULL;
CREATE UNIQUE INDEX `usuario_google_sub_key` ON `usuario`(`google_sub`);
