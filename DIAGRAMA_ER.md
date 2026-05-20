# Diagrama Entidad-Relación (ER)

## Pokeclicker - Modelo de Datos

---

## Entidades

### USUARIO

**Atributos:**

- `id` (PK) - Identificador único
- `email` (UK) - Email único del usuario
- `nombre` - Nombre del usuario
- `password` - Contraseña hasheada
- `monedas` - Monedas acumuladas (default: 0)
- `clicks` - Total histórico de clicks (default: 0)
- `tema` - Preferencia de tema (light/dark/system)
- `role` - Rol del usuario (jugador/admin)
- `fecha_creacion` - Fecha de creación
- `ultima_actualizacion` - Última actualización

**Índices:**

- `email`

---

### POKEMON

**Atributos:**

- `id` (PK) - Identificador único
- `usuario_id` (FK) - Referencia a Usuario
- `pokeapi_id` - ID del Pokémon en PokéAPI
- `cantidad` - Cantidad de este Pokémon capturado
- `fecha_captura` - Fecha de captura
- `indiceSlot` (nullable) - Posición en expositor (0-3) o null

**Restricciones:**

- Clave única: (usuario_id, pokeapi_id)

**Índices:**

- `usuario_id`
- `pokeapi_id`

---

### MEJORA

**Atributos:**

- `id` (PK) - Identificador único
- `usuario_id` (FK) - Referencia a Usuario
- `precio_item_id` (FK) - Referencia a PrecioItem
- `cantidad` - Cantidad de esta mejora comprada
- `precio_pagado` - Snapshot del precio al comprar
- `fecha_compra` - Fecha de compra

**Restricciones:**

- Clave única: (usuario_id, precio_item_id)

**Índices:**

- `usuario_id`

---

### PRECIO_ITEM

**Atributos:**

- `id` (PK) - Identificador único
- `nombre` (UK) - Nombre único del item
- `tipo` - Tipo de item (mejora/sobre)
- `precio_base` - Precio base del item
- `cps_bonus` - Bonus de clicks por segundo
- `click_bonus` - Bonus de click directo
- `activo` - Disponibilidad del item (soft delete)
- `fecha_creacion` - Fecha de creación

**Índices:**

- `tipo`

---

## Relaciones

### Relación: CAPTURA

- **De:** USUARIO (1)
- **A:** POKEMON (N)
- **Cardinalidad:** 1:N
- **Tipo:** Débil (Cascade delete)
- **Descripción:** Un usuario puede capturar múltiples Pokémon

**Clave participante en POKEMON:** usuario_id

---

### Relación: COMPRA

- **De:** USUARIO (1)
- **A:** MEJORA (N)
- **Cardinalidad:** 1:N
- **Tipo:** Débil (Cascade delete)
- **Descripción:** Un usuario puede comprar múltiples mejoras

**Clave participante en MEJORA:** usuario_id

---

### Relación: OPCIONES

- **De:** PRECIO_ITEM (1)
- **A:** MEJORA (N)
- **Cardinalidad:** 1:N
- **Tipo:** Fuerte (No cascade)
- **Descripción:** Un item de precio puede ser comprado múltiples veces

**Clave participante en MEJORA:** precio_item_id

---

## Restricciones de Integridad

### Restricciones de Clave Primaria

- USUARIO.id ✓
- POKEMON.id ✓
- MEJORA.id ✓
- PRECIO_ITEM.id ✓
- CONFIG_GLOBAL.id (siempre 1) ✓

### Restricciones de Clave Única

- USUARIO.email (no puede haber dos usuarios con mismo email)
- POKEMON (usuario_id, pokeapi_id) - no puede capturar el mismo Pokémon dos veces
- MEJORA (usuario_id, precio_item_id) - máximo una "línea" de compra por item
- PRECIO_ITEM.nombre (nombres únicos de items)

### Restricciones

- POKEMON.usuario_id → USUARIO.id (onDelete: Cascade)
- MEJORA.usuario_id → USUARIO.id (onDelete: Cascade)
- MEJORA.precio_item_id → PRECIO_ITEM.id

---

## Tabla de Cardinalidades

| Relación | Cardinalidad | Min USUARIO | Max USUARIO | Min Entidad | Max Entidad |
| ---------| Cardinalidad | Min USUARIO | Max USUARIO | Min Entidad | Max Entidad |
| ------- | ------------ | ----------- | ----------- | ----------- | ----------- |
| CAPTURA | 1:N | 1 | 1 | 0 | N |
| COMPRA | 1:N | 1 | 1 | 0 | N |
| OPCIONES| 1:N | 1 | 1 | 0 | N

---

## Notas de Implementación

### Soft Delete

- `PRECIO_ITEM.activo` implementa soft delete para mantener histórico de precios

### Snapshot de Datos

- `MEJORA.precio_pagado` guarda el precio al momento de compra (no es referencia a precio_base)

### Índices para Performance

- `USUARIO.email` - búsquedas por login
- `POKEMON.usuario_id` - listado de pokémon por usuario
- `POKEMON.pokeapi_id` - búsquedas de pokémon específicos
- `MEJORA.usuario_id` - listado de mejoras por usuario
- `PRECIO_ITEM.tipo` - filtrado por tipo de item

### Escalabilidad Futura

- La tabla POKEMON permite múltiples pokémon del mismo tipo (`cantidad`)
- La tabla MEJORA soporta niveles de mejora (`cantidad`)
- CONFIG_GLOBAL es extensible para nuevos parámetros

### Configuración Global

- El multiplicador de precios (`1.15`) es una constante en código (en `src/app/api/game/*`)
- No requiere tabla en BD — se mantiene como valor hardcoded para simplificar la arquitectura

---

**Última actualización:** 20 de Mayo de 2026  
**Versión:** 2.1 (ConfigGlobal eliminado - multiplicador como constante
