# 🚨 CODE SMELLS ANALYSIS - POKECLICKER

**Fecha:** Mayo 18, 2026  
**Analista:** Code Quality Review  
**Total de problemas:** 18 identificados (5 CRÍTICOS | 7 MAYORES | 6 MENORES)

---

## 📊 Resumen Ejecutivo

```
CRÍTICOS     ████████░░ 5/5 - REQUIEREN ACCIÓN INMEDIATA
MAYORES      ███████░░░ 7/7 - IMPACTAN MANTENIBILIDAD
MENORES      ██████░░░░ 6/6 - DEUDA TÉCNICA
```

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. **Race Condition en Save/Load GameState**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L254)  
**Severidad:** 🔴 CRÍTICA

**Problema:**

```tsx
// scheduleGameSave se ejecuta en CADA cambio de gameState
const scheduleGameSave = useCallback(() => {
  /* ... */
}, [gameState]);
// Esto crea múltiples saves concurrentes que pueden perder datos
```

**Impacto:**

- Pérdida de dinero/clicks al clickear rápido + comprar
- Pokémon duplicados en la BD
- Game state corrupto en cliente vs servidor

**Síntomas:**

- Dinero desaparece después de sesión cerrada
- Compras que se cobran pero no se registran

---

### 2. **Infinite Loop en Passive Income**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L367)  
**Severidad:** 🔴 CRÍTICA

```tsx
useEffect(() => {
  // setGameState() causa re-render → effect vuelve a ejecutarse
  setGameState((prev) => ({ ...prev, money: prev.money + prev.cps / 10 }));
}, [gameState.cps]); // ← Causa loop indirecto
```

**Impacto:**

- CPS fluctúa erróneamente
- Dinero se suma de forma no predecible
- Alto consumo de CPU

**Síntoma:** El dinero aumenta más rápido que lo que dice el CPS

---

### 3. **SQL Injection Potencial en upgrade.name**

**Ubicación:** [save/route.ts](src/app/api/game/save/route.ts#L100)  
**Severidad:** 🔴 CRÍTICA

```typescript
// El nombre viene del cliente sin validación
const nombre = upgrade.name; // "'; DROP TABLE mejoras; --" ?
prisma.mejora.update({
  where: { id: mejorasMap.get(nombre)! }, // ← Usando nombre como clave
});
```

**Impacto:**

- Corrupción de BD
- Pérdida de datos de usuarios
- Acceso no autorizado

---

### 4. **Falta de Rate Limiting en API**

**Ubicación:** [Todos los endpoints en `/api/`]  
**Severidad:** 🔴 CRÍTICA

**Problema:** Endpoints sin protección contra fuerza bruta:

- `/api/auth/register` - Sin límite de intentos
- `/api/game/save` - Puede spammear saves
- `/api/game/state` - Puede explotar con requests masivos

**Impacto:**

- DoS attacks posibles
- Diccionario attacks en login
- Colapso del servidor

---

### 5. **Type Casting Inseguro con `as any[]`**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L115)  
**Severidad:** 🔴 CRÍTICA

```typescript
const [_, gameResponse, pricesResponse] = results as any[];
// ↑ Pierde seguridad de tipos, puede causar crashes en runtime
```

---

## 🟠 PROBLEMAS MAYORES

### 6. **Duplicación de Código: scheduleGameSave vs forceGameSave**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L247-L330)  
**Tipo:** DRY Violation

Ambas funciones contienen ~60 líneas de código idéntico:

- Validación de datos (money, clicks, cps)
- Llamada a `/api/game/save`
- Error handling
- Actualización de refs

**Ejemplo:**

```tsx
// DENTRO DE scheduleGameSave (línea ~280)
if (gameState.money < 0) {
  console.warn("Invalid money...");
  return;
}
if (gameState.clicks < 0) {
  console.warn("Invalid clicks...");
  return;
}
if (gameState.cps < 0) {
  console.warn("Invalid CPS...");
  return;
}

// DENTRO DE forceGameSave (línea ~310) - REPETIDO EXACTAMENTE
if (gameState.money < 0) {
  console.warn("Invalid money...");
  return;
}
if (gameState.clicks < 0) {
  console.warn("Invalid clicks...");
  return;
}
if (gameState.cps < 0) {
  console.warn("Invalid CPS...");
  return;
}
```

**Impacto:** Mantenibilidad, bug fixes deben aplicarse en 2 lugares

---

### 7. **Código "Wet" - Refrescando Precios en 3 Lugares**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L223, L275, L442)  
**Tipo:** Repetición (WET - Write Everything Twice)

El mismo código de refresh de precios aparece en:

1. `loadGameFromDB()` - línea ~223
2. Efecto que refresca cada 5s - línea ~275
3. Después de cada `buyUpgrade()` - línea ~442

```typescript
// Código repetido 3 veces:
const pricesResponse = await fetch("/api/game/prices", {
  credentials: "include",
});
if (pricesResponse.ok) {
  const pricesData = await pricesResponse.json();
  const newPriceMap: Record<string, number> = {};
  pricesData.prices.forEach((price: any) => {
    newPriceMap[price.nombre] = price.precio_base;
  });
  setPriceBaseMap(newPriceMap);
  setPricingConfig(pricesData.config);
  const updatedPacks = PACKS.map((pack) => ({
    ...pack,
    cost: newPriceMap[pack.name] || pack.cost,
  }));
  setPacksData(updatedPacks);
}
```

**Solución:** Extraer a función `refreshPrices()`

---

### 8. **Missing Validation Schema en GameStateSave**

**Ubicación:** [save/route.ts](src/app/api/game/save/route.ts#L45)  
**Tipo:** Security + Type Safety

```typescript
// Sin validación Zod - solo comentario
const gameState = rawGameState; // Skip validation temporarily to debug
```

**Impacto:**

- Datos inválidos entran a BD (NaN, Infinity, negativos)
- Sin validación de estructura
- Sin validación de rangos

---

### 9. **Acumulación de Timeouts sin Limpieza Adecuada**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L247, L330)  
**Tipo:** Memory Leak

```tsx
saveTimeoutRef.current = setTimeout(async () => {
  /* ... */
}, delay);
// Si el componente desmonta mientras hay timeout pendiente:
// El timeout sigue corriendo en background
```

**Potencial leak:** Si se navega rápidamente o cambia de usuario

---

### 10. **Falta de Error Retry Logic en Saves**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L310)

```typescript
catch (error) {
  console.error("Error saving game state:", error);
  setIsSavePending(false); // Solo log - sin reintentos
}
// Si la red falla, se pierden datos sin notificación al usuario
```

---

### 11. **Session Expiration Sin Sincronización Correcta**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L305), [save/route.ts](src/app/api/game/save/route.ts#L50)

```typescript
if (response.status === 401) {
  window.location.href = "/auth/login"; // Hard redirect
  // El gameState local sigue siendo válido en caché
}
```

**Problema:** El usuario pierde progreso local no guardado

---

## 🟡 PROBLEMAS MENORES

### 12. **Inconsistencia: Algunos estados usan Refs, otros usan State**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L48-L75)

```tsx
const lastSaveRef = useRef<number>(0); // Ref
const needsSaveRef = useRef<boolean>(false); // Ref
const [pokedexOpen, setPokedexOpen] = useState(false); // State
const [selectedDisplaySlot, setSelectedDisplaySlot] = useState(null); // State
```

Criterio unclear - Debería ser:

- **State:** Si el cambio debe re-renderizar
- **Ref:** Si es solo tracking interno

---

### 13. **Missing PropTypes/TypeScript en Components**

**Ubicación:** [GameHeader.tsx](src/app/game/components/GameHeader.tsx), [Shop.tsx](src/app/game/components/Shop.tsx)  
**Tipo:** Type Safety

Los componentes hijos no tienen tipos exportados, documentación unclear

---

### 14. **LocalStorage sin Fallback Error Handling**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L79)

```typescript
const saved = localStorage.getItem("pokeclicker_theme");
// ¿Qué pasa en modo privado del navegador? ¿SSR?
```

---

### 15. **Hardcoded Magic Numbers**

**Ubicación:** Disperso en [GameClient.tsx]

```typescript
minTimeBetweenSaves = 2000; // ← Magic number
delay = needsSaveRef.current ? 300 : 5000; // ← Magic numbers
elapsed >= 100; // ← Magic number
(setClickEffect(null), 700); // ← Magic number
// ...
```

Debería ser constantes nombradas

---

### 16. **Missing Error Boundary para API Errors**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L110)

```typescript
if (!gameResponse.ok) {
  throw new Error(`Failed to load game state: ${gameResponse.status}...`);
}
// Error genérico, el usuario no sabe qué hacer
```

Debería mostrar UI específica: "Conexión perdida", "Servidor en mantenimiento", etc.

---

### 17. **No hay Debouncing en Display Slot Updates**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L405)

```typescript
const handleDisplaySlotSelect = (slot: number, pokemon: CollectedPokemon) => {
  setGameState((prev) => {
    /* Actualiza inmediatamente */
  });
  // Sin debounce, múltiples clicks rápidos = múltiples saves
};
```

---

### 18. **Falta de Optimización: Computed Values en Render**

**Ubicación:** [GameClient.tsx](src/app/game/GameClient.tsx#L485)

```typescript
const displayedPokemon: (CollectedPokemon | null)[] = [null, null, null, null];
gameState.collectedPokemon.forEach((pokemon) => {
  // ← Recalculado en cada render, debería ser useMemo
  if (
    pokemon.indiceSlot !== null &&
    pokemon.indiceSlot >= 0 &&
    pokemon.indiceSlot < 4
  ) {
    displayedPokemon[pokemon.indiceSlot] = pokemon;
  }
});
```

---

## 📋 Tabla Resumida

| ID  | Problema            | Severidad | Archivo        | Línea       | Impacto            |
| --- | ------------------- | --------- | -------------- | ----------- | ------------------ |
| 1   | Race Condition Save | 🔴        | GameClient.tsx | 254         | Pérdida de datos   |
| 2   | Infinite Loop CPS   | 🔴        | GameClient.tsx | 367         | CPS erróneo        |
| 3   | SQL Injection       | 🔴        | save/route.ts  | 100         | Seguridad crítica  |
| 4   | Sin Rate Limiting   | 🔴        | API routes     | Global      | DoS vulnerability  |
| 5   | `as any[]` casting  | 🔴        | GameClient.tsx | 115         | Runtime crash      |
| 6   | Duplicación Save    | 🟠        | GameClient.tsx | 247-330     | Mantenibilidad     |
| 7   | Refresh Precios x3  | 🟠        | GameClient.tsx | 223,275,442 | Mantenibilidad     |
| 8   | Sin Zod Validation  | 🟠        | save/route.ts  | 45          | Data integrity     |
| 9   | Memory Leaks        | 🟠        | GameClient.tsx | 247,330     | Memory bloat       |
| 10  | Sin Retry Logic     | 🟠        | GameClient.tsx | 310         | Pérdida silenciosa |
| 11  | Session Expiry      | 🟠        | GameClient.tsx | 305         | UX pobre           |
| 12  | Refs vs State       | 🟡        | GameClient.tsx | 48-75       | Confusión          |
| 13  | Sin PropTypes       | 🟡        | Components     | Global      | Type safety        |
| 14  | LocalStorage Unsafe | 🟡        | GameClient.tsx | 79          | SSR issues         |
| 15  | Magic Numbers       | 🟡        | GameClient.tsx | Disperso    | Mantenibilidad     |
| 16  | Sin Error UI        | 🟡        | GameClient.tsx | 110         | UX pobre           |
| 17  | Sin Debouncing      | 🟡        | GameClient.tsx | 405         | Saves excesivos    |
| 18  | Sin Memoization     | 🟡        | GameClient.tsx | 485         | Performance        |

---

## 🎯 Prioridades de Fixes

### ESTA SEMANA (2-3 horas)

- [ ] **#1** - Race Condition Save → Implementar con `isSavingRef`
- [ ] **#3** - SQL Injection → Usar IDs validados
- [ ] **#4** - Rate Limiting → Agregar Upstash/Redis
- [ ] **#8** - Zod Validation → Crear schema gameStateSave

### PROXIMA SEMANA (4-6 horas)

- [ ] **#2** - Infinite Loop CPS → Refactor con refs
- [ ] **#5** - Type Safety → Remover `as any`
- [ ] **#6-7** - Duplicación → Extraer funciones
- [ ] **#9** - Memory Leaks → Proper cleanup

### POSTERIORMENTE (Tech Debt)

- [ ] #10-18 - Mejoras incrementales de code quality

---

## 📚 Referencias

Ver documentos complementarios:

- [DEBUGGING_REPORT.md](DEBUGGING_REPORT.md) - Análisis detallado
- [QUICK_FIXES.md](QUICK_FIXES.md) - Código de fixes
- [TESTING_EXAMPLES.md](TESTING_EXAMPLES.md) - Tests propuestos
