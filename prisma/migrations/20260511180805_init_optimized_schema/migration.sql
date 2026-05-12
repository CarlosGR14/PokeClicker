-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `monedas` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `clicks` BIGINT NOT NULL DEFAULT 0,
    `tema` ENUM('light', 'dark', 'system') NOT NULL DEFAULT 'system',
    `role` ENUM('jugador', 'admin') NOT NULL DEFAULT 'jugador',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ultima_actualizacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuario_email_key`(`email`),
    INDEX `usuario_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pokemon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `pokeapi_id` INTEGER NOT NULL,
    `cantidad` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `fecha_captura` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `indiceSlot` TINYINT UNSIGNED NULL,

    INDEX `pokemon_usuario_id_idx`(`usuario_id`),
    INDEX `pokemon_pokeapi_id_idx`(`pokeapi_id`),
    UNIQUE INDEX `pokemon_usuario_id_pokeapi_id_key`(`usuario_id`, `pokeapi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mejora` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `precio_item_id` INTEGER NOT NULL,
    `cantidad` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `precio_pagado` INTEGER UNSIGNED NOT NULL,
    `fecha_compra` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mejora_usuario_id_idx`(`usuario_id`),
    UNIQUE INDEX `mejora_usuario_id_precio_item_id_key`(`usuario_id`, `precio_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `precio_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` CHAR(64) NOT NULL,
    `tipo` ENUM('mejora', 'sobre') NOT NULL,
    `precio_base` INTEGER UNSIGNED NOT NULL,
    `cps_bonus` DOUBLE NOT NULL DEFAULT 0,
    `click_bonus` DOUBLE NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `precio_item_nombre_key`(`nombre`),
    INDEX `precio_item_tipo_idx`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `config_global` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `multiplicador_costo` DOUBLE NOT NULL DEFAULT 1.15,
    `ultima_actualizacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pokemon` ADD CONSTRAINT `pokemon_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mejora` ADD CONSTRAINT `mejora_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mejora` ADD CONSTRAINT `mejora_precio_item_id_fkey` FOREIGN KEY (`precio_item_id`) REFERENCES `precio_item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
