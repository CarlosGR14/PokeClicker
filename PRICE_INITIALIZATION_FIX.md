# Fix: Inicialización de Precios en Nuevas Cuentas

## Problema Identificado

Cuando un usuario se registraba, las mejoras no se inicializaban con sus precios iniciales desde `PrecioItem`. Esto causaba que:

1. El usuario nuevo no tuviera mejoras disponibles al inicio
2. Si el admin luego creaba una mejora, no aparecería en cuentas ya creadas
3. No había sincronización entre `PrecioItem` y `Mejora` al registrarse

## Solución Implementada

### Cambio en `src/app/api/auth/register/route.ts`

Después de crear el usuario, ahora:

1. **Obtener precios de mejoras**: `prisma.precioItem.findMany({ where: { tipo: "mejora" } })`
2. **Crear mejoras iniciales**: Para cada `PrecioItem` de tipo "mejora", crear una fila en `Mejora` con:
   - `usuario_id`: ID del usuario nuevo
   - `nombre_item`: Nombre del item
   - `cantidad`: 0 (no comprada aún)
   - `precio_actual`: `precio_base` del PrecioItem (precio inicial)
   - `valor_multiplicador`: `cps_bonus` del PrecioItem
   - `click_bonus`: Del PrecioItem

### Código Agregado

```typescript
// Obtener todos los PrecioItem con tipo "mejora" para inicializar
const mejorasPrecios = await prisma.precioItem.findMany({
  where: { tipo: "mejora" },
});

// Crear mejoras por defecto para el usuario con precio inicial
if (mejorasPrecios.length > 0) {
  await prisma.mejora.createMany({
    data: mejorasPrecios.map((precioItem) => ({
      usuario_id: user.id,
      nombre_item: precioItem.nombre,
      cantidad: 0,
      precio_actual: precioItem.precio_base, // Usar precio_base como inicial
      valor_multiplicador: precioItem.cps_bonus,
      click_bonus: precioItem.click_bonus,
    })),
  });
}
```

## Flujo Actualizado

### Antes:

```
1. Usuario se registra → usuario creado sin mejoras ❌
2. Admin agrega mejora a PrecioItem → No aparece en usuarios existentes ❌
3. Usuario ve lista vacía de mejoras ❌
```

### Después:

```
1. Usuario se registra → usuario + mejoras iniciales creadas ✅
   - Todas las mejoras de tipo "mejora" se crean con cantidad=0
   - Cada mejora tiene precio_actual = precio_base de PrecioItem
2. Admin edita precio_base en PrecioItem
3. Usuario nuevo ve el nuevo precio al registrarse ✅
4. Usuarios existentes obtienen precio_actual en su tabla ✅
```

## Impacto

✅ **Nuevos usuarios**: Ven todas las mejoras disponibles desde el inicio con precios correctos
✅ **Sincronización**: `precio_actual` en Mejora siempre será el precio_base inicial de PrecioItem
✅ **Admin**: Los cambios a precios afectarán a nuevos usuarios automáticamente
✅ **Usuarios existentes**: Usarán el GET /api/game/state que obtiene precio_base actual

## Testing Recomendado

1. Registrar usuario nuevo
2. Verificar que tiene mejoras en BD: `SELECT * FROM mejora WHERE usuario_id = NEW_ID`
3. Verificar que `precio_actual` = `precio_base` de PrecioItem correspondiente
4. Cargar /game y verificar que ve todas las mejoras con precios correctos
5. Admin: cambiar precio en admin/economy
6. Usuario: actualizar página /game
7. Verificar: el precio se actualiza según el nuevo precio_base

## Notas

- `createMany` es más eficiente que crear mejoras una por una
- Si no hay mejoras de tipo "mejora", simplemente no crea nada (if check)
- Los sobres (tipo "sobre") no se inicializan como mejoras, solo como precios disponibles
- Cada usuario tiene su propia fila de Mejora por cada tipo de mejora disponible
