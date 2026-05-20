# Schema de Base de Datos - Pokeclicker

## Tabla: USUARIO

| Campo                | Tipo                          | Restricciones | Default   |
| -------------------- | ----------------------------- | ------------- | --------- |
| id                   | INT                           | PK, AI, NN    | —         |
| email                | VARCHAR(255)                  | UK, NN        | —         |
| nombre               | VARCHAR(255)                  | NN            | —         |
| password             | VARCHAR(255)                  | NN            | —         |
| monedas              | UNSIGNED INT                  | NN            | 0         |
| clicks               | BIGINT                        | NN            | 0         |
| tema                 | ENUM('light','dark','system') | NN            | 'system'  |
| role                 | ENUM('jugador','admin')       | NN            | 'jugador' |
| fecha_creacion       | DATETIME                      | NN            | NOW()     |
| ultima_actualizacion | DATETIME                      | NN            | NOW()     |

**Índices:** email  
**Clave única:** email

---

## Tabla: POKEMON

| Campo         | Tipo              | Restricciones       | Default |
| ------------- | ----------------- | ------------------- | ------- |
| id            | INT               | PK, AI, NN          | —       |
| usuario_id    | INT               | FK → usuario.id, NN | —       |
| pokeapi_id    | INT               | NN                  | —       |
| cantidad      | UNSIGNED SMALLINT | NN                  | 1       |
| fecha_captura | DATETIME          | NN                  | NOW()   |
| indiceSlot    | UNSIGNED TINYINT  | NULL (0-3)          | NULL    |

**Índices:** usuario_id, pokeapi_id  
**Clave única:** (usuario_id, pokeapi_id)  
**Cascade delete:** ON DELETE CASCADE

---

## Tabla: PRECIO_ITEM

| Campo          | Tipo                   | Restricciones | Default |
| -------------- | ---------------------- | ------------- | ------- |
| id             | INT                    | PK, AI, NN    | —       |
| nombre         | CHAR(64)               | UK, NN        | —       |
| tipo           | ENUM('mejora','sobre') | NN            | —       |
| precio_base    | UNSIGNED INT           | NN            | —       |
| cps_bonus      | FLOAT                  | NN            | 0       |
| click_bonus    | FLOAT                  | NN            | 0       |
| activo         | BOOLEAN                | NN            | TRUE    |
| fecha_creacion | DATETIME               | NN            | NOW()   |

**Índices:** tipo  
**Clave única:** nombre

---

## Tabla: MEJORA

| Campo          | Tipo              | Restricciones           | Default |
| -------------- | ----------------- | ----------------------- | ------- |
| id             | INT               | PK, AI, NN              | —       |
| usuario_id     | INT               | FK → usuario.id, NN     | —       |
| precio_item_id | INT               | FK → precio_item.id, NN | —       |
| cantidad       | UNSIGNED SMALLINT | NN                      | 1       |
| precio_pagado  | UNSIGNED INT      | NN                      | —       |
| fecha_compra   | DATETIME          | NN                      | NOW()   |

**Índices:** usuario_id  
**Clave única:** (usuario_id, precio_item_id)  
**Cascade delete:** ON DELETE CASCADE

---

## Relaciones

| De          | A       | Tipo | Cardinalidad | Descripción                                |
| ----------- | ------- | ---- | ------------ | ------------------------------------------ |
| USUARIO     | POKEMON | 1:N  | 1 ← → N      | Un usuario captura múltiples Pokémon       |
| USUARIO     | MEJORA  | 1:N  | 1 ← → N      | Un usuario compra múltiples mejoras        |
| PRECIO_ITEM | MEJORA  | 1:N  | 1 ← → N      | Un item puede ser comprado múltiples veces |

---

## Notas de Configuración

- **Multiplicador de precios global:** Constante en código (`1.15`) - No está en BD
- **Soft delete:** Implementado en `PRECIO_ITEM.activo` para mantener histórico
- **Snapshot de datos:** `MEJORA.precio_pagado` guarda el precio al momento de compra
- **Tema por usuario:** Cada usuario puede elegir light/dark/system

---

**Actualización:** 20 de Mayo de 2026  
**Versión:** 2.1 (ConfigGlobal eliminado)
