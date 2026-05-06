# 🐛 REPORTE EXHAUSTIVO DE DEBUGGING - POKECLICKER

**Fecha de análisis:** Mayo 6, 2026  
**Alcance:** GameClient.tsx, componentes de juego, endpoints API, autenticación, servicios  
**Severidad detectada:** 5 CRÍTICOS | 12 MAYORES | 8 MENORES

---

## 📋 TABLA DE CONTENIDOS

1. [Problemas Críticos](#problemas-críticos)
2. [Problemas Mayores](#problemas-mayores)
3. [Problemas Menores](#problemas-menores)
4. [Recomendaciones Generales](#recomendaciones-generales)

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. **RACE CONDITION EN SAVE/LOAD DE GAMESTATE**

**Ubicación:** `src/app/game/GameClient.tsx:170-220` y `src/app/api/game/save/route.ts:1-200`  
**Severidad:** CRÍTICA  
**Problema:**

- El componente actualiza `gameState` frecuentemente (cada clic, pasiva, compra)
- `scheduleGameSave()` se ejecuta cada vez que `gameState` cambia
- Si el usuario realiza múltiples acciones rápidamente (clickear + comprar), puede ocurrir:
  - La save anterior aún está en progreso cuando llega la nueva
  - El servidor podría guardar datos parciales
  - Se pierden transacciones intermedias

**Código problemático:**

```javascript
// GameClient.tsx:185-210
useEffect(() => {
  if (!isLoading) {
    scheduleGameSave(); // Se ejecuta en CADA cambio de gameState
  }
  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };
}, [gameState, isLoading]); // Dependencia de gameState provoca re-renders infinitos
```

**Impacto:**

- Pérdida de dinero o clicks
- Pokémon duplicados o perdidos
- Inconsistencia BD vs cliente
- Posible gamebreak si el usuario tiene muchas mejoras

**Fix sugerido:**

```javascript
// Usar un flag debounce con timestamp más inteligente
const saveTimeoutRef = (useRef < NodeJS.Timeout) | (null > null);
const isSavingRef = useRef < boolean > false;

const scheduleGameSave = useCallback(() => {
  if (isSavingRef.current) return; // NO guardar si ya hay una guardada

  if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

  saveTimeoutRef.current = setTimeout(async () => {
    isSavingRef.current = true;
    try {
      const response = await fetch("/api/game/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameState),
      });
      if (!response.ok) throw new Error("Save failed");
    } catch (error) {
      console.error("Error saving:", error);
      // RETRY logic needed
    } finally {
      isSavingRef.current = false;
    }
  }, 3000);
}, [gameState]);
```

---

### 2. **POTENCIAL BUCKET INFINITE LOOP - PASSIVE INCOME**

**Ubicación:** `src/app/game/GameClient.tsx:260-280`  
**Severidad:** CRÍTICA  
**Problema:**

```javascript
useEffect(() => {
  if (gameState.cps === 0) return;
  let lastTime = Date.now();
  let animationId: number;

  const updatePassiveIncome = () => {
    const now = Date.now();
    const elapsed = now - lastTime;

    if (elapsed >= 100) {
      setGameState((prev) => ({
        ...prev,
        money: prev.money + prev.cps / 10, // ← setGameState causa nuevo render
      }));
      lastTime = now;
    }

    animationId = requestAnimationFrame(updatePassiveIncome);
  };

  animationId = requestAnimationFrame(updatePassiveIncome);
  return () => cancelAnimationFrame(animationId);
}, [gameState.cps]); // ← Cada cambio de gameState re-dispara este effect
```

**La lógica crea un loop indirecto:**

1. `gameState` cambia → effect corre
2. effect llama `setGameState()` → `gameState` cambia
3. vuelve a paso 1

**Impacto:**

- El dinero puede crecer exponencialmente si el servidor está lento
- Fluctuaciones erráticas en el CPS visible vs guardado
- Posibles crashes si `gameState` crece mucho

**Fix sugerido:**

```javascript
useEffect(() => {
  if (gameState.cps === 0) return;
  let lastTime = Date.now();
  let animationId: number;
  let pendingMoney = 0;

  const updatePassiveIncome = () => {
    const now = Date.now();
    const elapsed = (now - lastTime) / 1000; // en segundos
    pendingMoney += gameState.cps * elapsed;

    if (pendingMoney >= 1) { // Solo guardar cuando acumule dinero significativo
      setGameState((prev) => ({
        ...prev,
        money: prev.money + Math.floor(pendingMoney),
      }));
      pendingMoney -= Math.floor(pendingMoney);
      lastTime = now;
    }

    animationId = requestAnimationFrame(updatePassiveIncome);
  };

  animationId = requestAnimationFrame(updatePassiveIncome);
  return () => cancelAnimationFrame(animationId);
}, [gameState.cps]); // MEJOR: no incluir `gameState.cps` si no cambia frecuentemente
```

---

### 3. **SQL INJECTION POTENCIAL EN NOMBRE DE UPGRADE**

**Ubicación:** `src/app/api/game/save/route.ts:90-110`  
**Severidad:** CRÍTICA  
**Problema:**

```typescript
// Línea 90-95
const mejorasMap = new Map(mejorasExistentes.map((m) => [m.nombre_item, m.id]));

// Línea 97+
const nombre = upgrade.name; // ← Viene directamente del cliente
// ...
prisma.mejora.update({
  where: { id: mejorasMap.get(nombre)! }, // ID sacado del mapa basado en nombre del cliente
  data: {
    nombre_item: nombre, // ← Podría ser una inyección
    cantidad: upgrade.count,
    // ...
  },
});
```

El problema: si el cliente envía `upgrade.name = "'; DROP TABLE mejoras; --"`, podría causar daños.  
Aunque Prisma ORM proporciona protección parcial, es mejor usar `upgrade.id` del servidor.

**Impacto:**

- Corrupción de BD
- Pérdida de datos del usuario
- Acceso no autorizado

**Fix sugerido:**

```typescript
// En /api/game/save/route.ts
const VALID_UPGRADE_IDS = new Set(INITIAL_UPGRADES.map((u) => u.id));

gameState.upgrades.forEach((upgrade) => {
  // Validar que el ID sea conocido
  if (!VALID_UPGRADE_IDS.has(upgrade.id)) {
    throw new Error(`Invalid upgrade ID: ${upgrade.id}`);
  }

  // Usar el ID como llave, NO el nombre
  const upgradeName = INITIAL_UPGRADES.find((u) => u.id === upgrade.id)?.name;
  // ...
});
```

---

### 4. **NO HAY RATE LIMITING EN ENDPOINTS API**

**Ubicación:** Todos los endpoints en `src/app/api/`  
**Severidad:** CRÍTICA  
**Problema:**

- `/api/game/save` puede ser llamado ilimitadamente
- `/api/game/state` sin límite de requests
- `/api/auth/register` permite crear cuentas sin límite
- Vulnerable a DDoS, brute force y ataque de fuerza bruta

Un atacante podría:

```bash
# Spam de requests
for i in {1..10000}; do
  curl -X POST http://localhost:3000/api/game/save \
    -H "Content-Type: application/json" \
    -d '{"money":999999999,...}'
done

# O crear cuentas:
for email in user{1..10000}@test.com; do
  curl -X POST http://localhost:3000/api/auth/register \
    -d "{\"email\":\"$email\",\"password\":\"pass123\",\"name\":\"test\"}"
done
```

**Impacto:**

- Servidor colapsado
- BD saturada
- Dinero inflado sin límite
- Múltiples cuentas falsas

**Fix sugerido:**

```typescript
// Usar middleware de rate limiting (ej: redis o memoria local)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests por hora
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const identifier =
    session?.user?.email || request.headers.get("x-forwarded-for");

  const { success } = await ratelimit.limit(identifier);
  if (!success) {
    return new NextResponse("Too many requests", { status: 429 });
  }
  // ... continuar con lógica
}
```

---

### 5. **NO HAY VALIDACIÓN DE ENTRADA SUFICIENTE - GAMESTATE DESDE CLIENTE**

**Ubicación:** `src/app/api/game/save/route.ts:43-55`  
**Severidad:** CRÍTICA  
**Problema:**

```typescript
// Líneas 43-55
const gameState: GameState = await request.json();

// Solo valida tipos básicos
if (
  typeof gameState.money !== "number" ||
  typeof gameState.clicks !== "number" ||
  typeof gameState.cps !== "number"
) {
  return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
}
```

**Faltan validaciones críticas:**

- `gameState.money` podría ser negativo, infinito, o NaN
- `gameState.clicks` podría ser más alto de lo posible
- `gameState.upgrades.count` podría ser ilógico
- `gameState.collectedPokemon` podría contener IDs inválidos

Un cliente malicioso podría:

```javascript
// Tricar dinero ilimitado
fetch("/api/game/save", {
  method: "POST",
  body: JSON.stringify({
    money: 999999999999999999,
    clicks: 999999999999999999,
    cps: 999999,
    upgrades: [...],
    collectedPokemon: []
  })
});
```

**Impacto:**

- Dinero inflado sin límite
- Todos los upgrades al máximo sin costo
- Leaderboards comprometidos

**Fix sugerido:**

```typescript
// Crear un schema Zod para validación
import { z } from "zod";

const GameStateSchema = z.object({
  money: z.number().min(0).max(1e10).safe(),
  clicks: z.number().min(0).max(1e10).safe(),
  cps: z.number().min(0).max(1e6),
  upgrades: z.array(
    z.object({
      id: z.enum(VALID_UPGRADE_IDS),
      count: z.number().int().min(0).max(1000),
      cost: z.number().min(0),
      cpsBonus: z.number().min(0),
      clickBonus: z.number().min(0).optional(),
    }),
  ),
  collectedPokemon: z.array(
    z.object({
      id: z.string().regex(/^\d+_\d+$/), // Validar formato
      rarity: z.enum(["common", "rare", "epic", "legendary"]),
      indiceSlot: z.number().int().min(0).max(3).nullable().optional(),
    }),
  ),
});

const result = GameStateSchema.safeParse(gameState);
if (!result.success) {
  return NextResponse.json(
    { error: "Validación fallida", issues: result.error.flatten() },
    { status: 400 },
  );
}

const validatedState = result.data;
```

---

## 🟠 PROBLEMAS MAYORES

### 6. **MEMORY LEAK - Event Listeners No Removidos en Modales**

**Ubicación:** `src/app/game/components/PokedexModal.tsx:10-25`, `DisplaySlotModal.tsx:12-28`, etc.  
**Severidad:** MAYOR  
**Problema:**

```javascript
// PokedexModal.tsx
useEffect(() => {
  if (!open) return;

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  document.addEventListener("keydown", handleEscape);
  return () => document.removeEventListener("keydown", handleEscape); // Bien
}, [open, onClose]); // PROBLEMA: `onClose` puede cambiar frecuentemente
```

**El problema:**

- Si `onClose` es una función inline del padre, se crea una nueva en cada render
- Esto causa que el cleanup se ejecute innecesariamente
- Si hay múltiples modales abiertos simultáneamente, habrá múltiples listeners

**Impacto:**

- Consumo excesivo de memoria
- Rendimiento degradado después de tiempo prolongado
- Comportamiento erratic de teclado

**Fix sugerido:**

```javascript
useEffect(() => {
  if (!open) return;

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  // Usar `{ once: true }` para cleanup automático
  document.addEventListener("keydown", handleEscape);

  return () => document.removeEventListener("keydown", handleEscape);
}, [open]); // NO incluir onClose en dependencias
```

---

### 7. **FALTA DE MANEJO DE ERROR PARA PROMESAS EN LOADGAMEFROMDB**

**Ubicación:** `src/app/game/GameClient.tsx:115-155`  
**Severidad:** MAYOR  
**Problema:**

```javascript
const filledPokemon = await Promise.all(
  data.collectedPokemon.map(async (pokemon) => {
    if (pokemon.name && pokemon.image) return pokemon;
    try {
      const details = await getPokemonById(parseInt(pokemon.id));
      return {
        ...pokemon,
        name: details.name,
        image: details.image,
      };
    } catch (error) {
      console.error(`Error fetching Pokemon ${pokemon.id}:`, error);
      return pokemon; // Retorna sin nombre/imagen
    }
  }),
);
```

**Si 100 Pokémon fallan a la vez:**

- El Promise.all() espera a todos
- Algunos Pokémon quedarán sin imagen
- El UI mostrará pokémon "vacíos"

**Impacto:**

- La carga puede fallar completamente si hay error de red
- Pokémon sin imagen en Pokedex
- Expositor puede no renderizar correctamente

**Fix sugerido:**

```javascript
// Usar Promise.allSettled en lugar de Promise.all
const results = await Promise.allSettled(
  data.collectedPokemon.map(async (pokemon) => {
    if (pokemon.name && pokemon.image) return pokemon;
    const details = await getPokemonById(parseInt(pokemon.id));
    return { ...pokemon, name: details.name, image: details.image };
  }),
);

const filledPokemon = results.map((result, idx) => {
  if (result.status === "fulfilled") return result.value;
  console.warn(`Failed to load Pokemon ${idx}`);
  return data.collectedPokemon[idx]; // Fallback
});
```

---

### 8. **SINCRONIZACIÓN DE ESTADO PERDIDA ENTRE CLIENTE Y SERVIDOR**

**Ubicación:** `src/app/game/GameClient.tsx:130-145` (load) vs `src/app/api/game/save/route.ts` (save)  
**Severidad:** MAYOR  
**Problema:**

- El cliente carga el estado inicial
- El usuario juega (clicks, compras, opening packs)
- Si otro cliente/tab abre el mismo usuario, carga estado antiguo
- El primero y segundo cliente tienen datos diferentes

**Ejemplo de bug:**

```
Tab 1: Carga $100 → Compra upgrade por $50 → Tiene $50
Tab 2: Carga $100 → Compra upgrade por $50 → Tiene $50
Servidor salva Tab 1: $50
Servidor salva Tab 2: $50 (✓ correcto por ahora)
Tab 1: Carga actualización → ve $50 pero perdió el evento de compra de Tab 2
```

**Impacto:**

- Dinero desaparecido/duplicado en multitab
- Pokémon duplicados en diferentes tabs
- Mejoras compradas en un tab no se ven en otro

**Fix sugerido:**

```javascript
// Agregar optimistic locking o versioning
interface GameState {
  version: number; // Agregar contador de versión
  // ... resto del estado
}

// En el cliente
const [gameState, setGameState] = useState<GameState>(initialState);

const saveGameToDB = async () => {
  try {
    const response = await fetch("/api/game/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...gameState,
        version: gameState.version, // Enviar versión actual
      }),
    });

    if (response.status === 409) {
      // Conflict - alguien más guardó primero
      const freshState = await fetch("/api/game/state").then(r => r.json());
      setGameState(freshState);
      alert("Estado desactualizado, recargando...");
    }
  } catch (error) {
    console.error("Error saving:", error);
  }
};

// En el servidor (/api/game/save)
if (gameState.version !== dbVersion) {
  return NextResponse.json(
    { error: "Version conflict", status: 409 }
  );
}
// Guardar e incrementar versión en BD
```

---

### 9. **NO HAY CLEANUP PARA CLICK EFFECT TIMEOUT**

**Ubicación:** `src/app/game/GameClient.tsx:300-310`  
**Severidad:** MAYOR  
**Problema:**

```javascript
const handlePokemonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  try {
    // ...
    setClickEffect({ x, y, id: Math.random().toString() });
    setTimeout(() => setClickEffect(null), 700); // ← Sin limpieza
    // ...
  } catch (error) {
    console.error("Click handler error:", error);
  }
};
```

**El problema:**

- Si el usuario hace 1000 clicks rápidamente:
  - Se crean 1000 timeouts
  - Cada uno llama `setClickEffect(null)` después de 700ms
  - Eso es 1000 renders innecesarios
  - Acumula timeouts no limpios en memoria

**Impacto:**

- Memory leak si hay spam de clicks
- Rendimiento degradado
- Posible crash si el juego se juega por mucho tiempo

**Fix sugerido:**

```javascript
const clickEffectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handlePokemonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  try {
    // Limpiar timeout anterior
    if (clickEffectTimeoutRef.current) {
      clearTimeout(clickEffectTimeoutRef.current);
    }

    setClickEffect({ x, y, id: Math.random().toString() });

    clickEffectTimeoutRef.current = setTimeout(() => {
      setClickEffect(null);
      clickEffectTimeoutRef.current = null;
    }, 700);
  } catch (error) {
    console.error("Click handler error:", error);
  }
};

// Cleanup en desmount o en otro effect
useEffect(() => {
  return () => {
    if (clickEffectTimeoutRef.current) {
      clearTimeout(clickEffectTimeoutRef.current);
    }
  };
}, []);
```

---

### 10. **AUTENTICACIÓN DÉBIL - NO VALIDA CAMBIOS DE SESIÓN**

**Ubicación:** `src/app/game/GameClient.tsx:95` y `src/auth.ts`  
**Severidad:** MAYOR  
**Problema:**

```javascript
// GameClient.tsx:95
const { data: session } = useSession();
// ...
useEffect(() => {
  if (session?.user?.email) {
    loadGameFromDB(); // Solo carga UNA VEZ cuando session cambia
  }
}, [session?.user?.email]);
```

**El problema:**

- Si la sesión expira mientras el usuario está jugando, no se da cuenta
- El usuario sigue haciendo cambios pero no puede guardar
- Si la sesión cambia a otro usuario, el estado del juego no se actualiza

**Impacto:**

- Pérdida de progreso
- Datos de usuario A guardados con credenciales de usuario B
- Vulnerabilidad de sesión

**Fix sugerido:**

```javascript
useEffect(() => {
  if (!session) {
    // Sesión expirada - redirigir o resetear
    setGameState(getDefaultGameState());
    window.location.href = "/auth/login";
    return;
  }

  if (session?.user?.email) {
    loadGameFromDB();
  }
}, [session?.user?.email, session]);

// Agregar handler para cambios de sesión
useEffect(() => {
  const handleSessionChange = (event: SessionCallbackEvent) => {
    if (!event.data) {
      // Sesión perdida
      setGameState(getDefaultGameState());
    }
  };

  // Escuchar cambios de sesión
  const unsubscribe = SessionProvider?.subscribe(handleSessionChange);
  return () => unsubscribe?.();
}, []);
```

---

### 11. **FALTA VALIDACIÓN EN POKEDEX - RARITY INCONSISTENTE**

**Ubicación:** `src/app/game/types.ts:115-140` y `src/app/api/game/state/route.ts:45-50`  
**Severidad:** MAYOR  
**Problema:**

```javascript
// types.ts - getRarityByPokemonId
export function getRarityByPokemonId(pokemonId: number): CollectedPokemon["rarity"] {
  if (LEGENDARY_IDS.includes(pokemonId)) return "legendary";
  if (EPIC_IDS.includes(pokemonId)) return "epic";
  if (pokemonId > 151) return "rare"; // ← Esto es arbitrario
  return "common";
}

// Pero en state/route.ts, puede haber inconsistencia:
rarity: getRarityByPokemonId(pokemon.pokeapi_id), // Usa función
```

**El problema:**

- Si se agregarn nuevos Pokémon legendarios, la lógica se rompe
- La BD podría tener una rarity guardada, pero la función devuelve otra
- Pokémon #151 (Mew) es legendario pero la función lo clasifica como common

**Impacto:**

- Rarezas inconsistentes entre cliente y servidor
- Leaderboard incorrecto
- Interfaz confusa

**Fix sugerido:**

```javascript
// Guardar rarity en BD, no calcularla
const pokemon = await prisma.pokemon.findUnique({
  where: { id: pokemonId },
});

// Usar el rarity guardado en BD
const rarity = pokemon.rarity; // ← De la BD, no calculado
```

---

### 12. **POTENCIAL TIMING ATTACK EN LOGIN**

**Ubicación:** `src/auth.ts:50-65`  
**Severidad:** MAYOR  
**Problema:**

```javascript
const usuario = await prisma.usuario.findUnique({
  where: { email: credentials.email },
});

if (!usuario) {
  throw new Error("Email o contraseña incorrectos"); // ← Respuesta inmediata
}

const isPasswordValid = await bcrypt.compare(
  credentials.password,
  usuario.password, // ← Bcrypt toma tiempo
);

if (!isPasswordValid) {
  throw new Error("Email o contraseña incorrectos"); // ← Respuesta después de tiempo
}
```

**El problema:**

- Si el email NO existe: respuesta rápida
- Si el email existe pero contraseña es mala: respuesta lenta (bcrypt delay)
- Un atacante puede enumerar emails válidos midiendo tiempos

**Impacto:**

- Email enumeration attack
- Compromiso de privacidad de usuarios

**Fix sugerido:**

```javascript
// Siempre hacer bcrypt aunque el email no exista
const usuario = await prisma.usuario.findUnique({
  where: { email: credentials.email },
});

// Dummy hash si el usuario no existe
const hashToCompare = usuario?.password || "$2b$10$dummyhash";

const isPasswordValid = await bcrypt.compare(
  credentials.password,
  hashToCompare,
);

// Volver error genérico
if (!usuario || !isPasswordValid) {
  throw new Error("Credenciales inválidas");
}

return {
  /* ... */
};
```

---

### 13. **FALTA VALIDACIÓN DE POKÉMON ID**

**Ubicación:** `src/app/game/components/DisplaySlotModal.tsx` y `src/app/api/game/save/route.ts:160-180`  
**Severidad:** MAYOR  
**Problema:**

```javascript
// Cuando el usuario selecciona un Pokémon para mostrar
const handleDisplaySlotSelect = (slot: number, pokemon: CollectedPokemon) => {
  needsSaveRef.current = true;
  setGameState((prev) => {
    // ← No valida que el pokemon pertenezca al usuario
    // ← No valida que el slot sea válido (0-3)
    // ...
  });
};
```

Un atacante podría modificar el cliente para:

```javascript
// Mostrar un Pokémon que no le pertenece
// O asignar a slot 999
```

**Impacto:**

- Mostrar Pokémon de otros usuarios
- Datos inconsistentes

**Fix sugerido:**

```javascript
const handleDisplaySlotSelect = (slot: number, pokemon: CollectedPokemon) => {
  // Validar slot
  if (!Number.isInteger(slot) || slot < 0 || slot > 3) {
    console.error("Invalid slot");
    return;
  }

  // Validar que el pokémon existe en el estado del usuario
  const pokemonExists = gameState.collectedPokemon.some(p => p.id === pokemon.id);
  if (!pokemonExists) {
    console.error("Pokemon not found in collection");
    return;
  }

  needsSaveRef.current = true;
  setGameState((prev) => { /* ... */ });
};
```

---

### 14. **PROMISES SIN AWAIT O ERROR HANDLING**

**Ubicación:** `src/app/game/components/Shop.tsx:35-55`  
**Severidad:** MAYOR  
**Problema:**

```javascript
useEffect(() => {
  const loadItemImages = async () => {
    const images = new Map<string, string>();
    for (const upgrade of upgrades) {
      const pokeapiItemName = UPGRADE_TO_ITEM_MAP[upgrade.id];
      if (pokeapiItemName && !itemImages.has(upgrade.id)) {
        try {
          const response = await fetch(
            `/api/pokeapi/item?id=${encodeURIComponent(pokeapiItemName)}`,
          );
          if (response.ok) {
            const item = await response.json();
            if (item.image) {
              images.set(upgrade.id, item.image);
            }
          }
        } catch (error) {
          console.error(`Failed to load image for ${upgrade.id}:`, error);
          // No hace nada si falla
        }
      }
    }
    if (images.size > 0) {
      setItemImages((prev) => new Map([...prev, ...images]));
    }
  };

  if (shopTab === "mejoras") {
    loadItemImages(); // ← Sin await aquí, pero es async
  }
}, [shopTab, upgrades, itemImages]); // ← itemImages en dependencia causa loop
```

**El problema:**

- El effect tiene `itemImages` en dependencias
- Cuando `setItemImages` es llamado, causa re-render
- El effect vuelve a ejecutarse
- Potencial loop infinito

**Impacto:**

- CPU al 100%
- Interfaz congelada
- Requests duplicadas a PokeAPI

**Fix sugerido:**

```javascript
useEffect(() => {
  const loadItemImages = async () => {
    const images = new Map<string, string>();

    const loadPromises = upgrades
      .filter(upgrade => {
        const itemName = UPGRADE_TO_ITEM_MAP[upgrade.id];
        return itemName && !itemImages.has(upgrade.id);
      })
      .map(async (upgrade) => {
        try {
          const response = await fetch(
            `/api/pokeapi/item?id=${encodeURIComponent(UPGRADE_TO_ITEM_MAP[upgrade.id])}`,
          );
          if (!response.ok) throw new Error("Failed to fetch");

          const item = await response.json();
          if (item.image) {
            return [upgrade.id, item.image] as const;
          }
        } catch (error) {
          console.error(`Failed to load image for ${upgrade.id}:`, error);
        }
        return null;
      });

    const results = await Promise.allSettled(loadPromises);
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        const [id, image] = result.value;
        images.set(id, image);
      }
    });

    if (images.size > 0) {
      setItemImages((prev) => new Map([...prev, ...images]));
    }
  };

  if (shopTab === "mejoras") {
    loadItemImages();
  }
}, [shopTab]); // ← NO incluir itemImages
```

---

## 🟡 PROBLEMAS MENORES

### 15. **FALTA DE LOADER/SPINNER EN LOADGAMEFROMDB**

**Ubicación:** `src/app/game/GameClient.tsx:95-155`  
**Severidad:** MENOR  
**Problema:** No hay indicador visual de que se está cargando el juego  
**Fix:** Mostrar spinner mientras `isLoading === true`

### 16. **CONSOLE.ERROR/CONSOLE.LOG SIN CONTEXTO EN PRODUCCIÓN**

**Ubicación:** Múltiples ubicaciones  
**Severidad:** MENOR  
**Problema:** Los errores se loguean sin ID de sesión o contexto  
**Fix:** Agregar logging middleware con contexto

### 17. **TIPOS NO EXPORTADOS O INCONSISTENTES**

**Ubicación:** `src/app/game/types.ts`  
**Severidad:** MENOR  
**Problema:** `GameState` interface en types.ts vs en save/route.ts (linea 15)  
**Fix:** Mover tipos a archivo centralizado

### 18. **FALTA DE VALIDACIÓN EN REGISTER ENDPOINT**

**Ubicación:** `src/app/api/auth/register/route.ts`  
**Severidad:** MENOR  
**Problema:** Nombre vacío es permitido (`name: z.string().min(1)` es bueno, pero no se chequea long máximo)  
**Fix:** Agregar máximo de caracteres

### 19. **MISSING PLACEHOLDER EN IMG ELEMENTOS**

**Ubicación:** Múltiples componentes  
**Severidad:** MENOR  
**Problema:** Algunas imágenes no tienen placeholder  
**Fix:** Agregar `placeholder="blur"` en Next/Image

### 20. **HARDCODED TIMEOUT VALUES**

**Ubicación:** `src/app/game/GameClient.tsx:230, 250, 300, etc.`  
**Severidad:** MENOR  
**Problema:** Valores mágicos (700ms, 5000ms, 100ms, etc.)  
**Fix:** Mover a constantes configurables

### 21. **NO HAY TESTS UNITARIOS**

**Ubicación:** Proyecto completo  
**Severidad:** MENOR  
**Problema:** Sin cobertura de tests  
**Fix:** Agregar Jest + React Testing Library

### 22. **FALTA DE ERROR BOUNDARY**

**Ubicación:** `src/app/game/GameClient.tsx`  
**Severidad:** MENOR  
**Problema:** Si un componente falla, el juego completo se cae  
**Fix:** Envolver con Error Boundary

---

## 📊 RECOMENDACIONES GENERALES

### Prioridad de Fixes (INMEDIATO)

1. ✅ Rate limiting en todos los endpoints
2. ✅ Validación exhaustiva de entrada en `/api/game/save`
3. ✅ Fix de race condition en save/load
4. ✅ Fix de infinite loop en passive income
5. ✅ SQL injection prevention

### Prioridad de Fixes (CORTO PLAZO)

6. Sincronización multitab (versioning)
7. Memory leak cleanup
8. Authentication hardening
9. Timing attack mitigation
10. Promise error handling

### Prioridad de Fixes (MEDIANO PLAZO)

11. Tests unitarios
12. Error boundaries
13. Logging centralizado
14. Monitoreo de performance
15. Documentación

### Stack Recomendado para Fixes

- **Rate Limiting:** `@upstash/ratelimit` + Redis
- **Validación:** Zod (ya usado) - expandir cobertura
- **Testing:** Jest + React Testing Library
- **Monitoring:** Sentry o similar
- **Logging:** Winston o Pino

### Checklist de Security

- [ ] All API endpoints have rate limiting
- [ ] All input is validated with Zod schemas
- [ ] CORS properly configured
- [ ] SQL injection prevention (using Prisma correctly)
- [ ] CSRF tokens on POST/PUT/DELETE
- [ ] XSS prevention (Next.js default)
- [ ] Authentication verification on sensitive routes
- [ ] Password hashing (bcrypt ✓)
- [ ] Session management secure
- [ ] Error messages don't leak info

---

## 📈 IMPACTO ESTIMADO

| Crítica | Mayor | Menor | Total |
| ------- | ----- | ----- | ----- |
| 5       | 9     | 8     | 22    |
| 🔴      | 🟠    | 🟡    |       |

**Riesgo General:** ALTO  
**Recomendación:** Pausar desarrollo de features hasta fijar problemas críticos

---

**Generado:** 2026-05-06  
**Analista:** GitHub Copilot  
**Próxima revisión recomendada:** Después de implementar fixes críticos
