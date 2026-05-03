-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `monedas` INTEGER NOT NULL DEFAULT 0,
    `multiplicador` DOUBLE NOT NULL DEFAULT 1.0,
    `role` VARCHAR(191) NOT NULL DEFAULT 'jugador',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pokemon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `pokeapi_id` INTEGER NOT NULL,
    `fecha_captura` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expuesto` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mejora` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `nombre_item` VARCHAR(191) NOT NULL,
    `precio_actual` INTEGER NOT NULL,
    `valor_multiplicador` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pokemon` ADD CONSTRAINT `pokemon_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mejora` ADD CONSTRAINT `mejora_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
