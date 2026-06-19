/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `telefone` to the `usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `telefone` VARCHAR(20) NOT NULL,
    ADD COLUMN `username` VARCHAR(30) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `usuario_username_key` ON `usuario`(`username`);

-- RedefineIndex
CREATE UNIQUE INDEX `usuario_email_key` ON `usuario`(`email`);
DROP INDEX `Usuario_email_key` ON `usuario`;
