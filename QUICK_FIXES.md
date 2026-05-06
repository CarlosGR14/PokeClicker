# 🔧 QUICK FIXES - POKECLICKER DEBUGGING

## CRÍTICOS - Implementar AHORA (estimado: 2-3 horas)

### 1. Add Rate Limiting to All API Endpoints

```bash
npm install @upstash/ratelimit redis
```

**Archivo:** `src/middleware.ts` (crear nuevo)

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

Aplicar en: `api/game/save`, `api/game/state`, `api/auth/register`

---

### 2. Fix Race Condition in GameClient Save Logic

**File:** `src/app/game/GameClient.tsx` (líneas 170-220)

```typescript
// ANTES (PROBLEMATICO):
useEffect(() => {
  if (!isLoading) {
    scheduleGameSave();
  }
  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };
}, [gameState, isLoading]); // ← Causa re-renders infinitos

// DESPUES (CORRECTO):
const isSavingRef = useRef<boolean>(false);

const scheduleGameSave = useCallback(() => {
  if (isSavingRef.current || isLoading) return;

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
      lastSaveRef.current = Date.now();
      needsSaveRef.current = false;
      console.log("Game saved");
    } catch (error) {
      console.error("Error saving:", error);
      // Retry logic aquí si es necesario
    } finally {
      isSavingRef.current = false;
    }
  }, 3000);
}, [gameState, isLoading]);

useEffect(() => {
  if (!isLoading && needsSaveRef.current) {
    scheduleGameSave();
  }

  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };
}, [isLoading, needsSaveRef.current, scheduleGameSave]);
```

---

### 3. Add Zod Validation for GameState Save

**File:** `src/lib/validations/game.ts` (crear nuevo)

```typescript
import { z } from "zod";
import { INITIAL_UPGRADES } from "@/app/game/types";

const VALID_UPGRADE_IDS = new Set(INITIAL_UPGRADES.map((u) => u.id));

export const gameStateSaveSchema = z.object({
  money: z.number().min(0).max(1e10).safe(),
  clicks: z.number().min(0).safe(),
  cps: z.number().min(0).max(1e6),
  upgrades: z.array(
    z.object({
      id: z.string().refine((id) => VALID_UPGRADE_IDS.has(id)),
      name: z.string().min(1).max(100),
      cost: z.number().min(0),
      count: z.number().int().min(0).max(10000),
      cpsBonus: z.number().min(0),
      clickBonus: z.number().min(0).optional(),
      description: z.string(),
    }),
  ),
  collectedPokemon: z.array(
    z.object({
      id: z.string().regex(/^\d+_\d+$/),
      name: z.string(),
      image: z.string().url().or(z.literal("")),
      rarity: z.enum(["common", "rare", "epic", "legendary"]),
      indiceSlot: z.number().int().min(0).max(3).nullable().optional(),
      expuesto: z.boolean().optional(),
    }),
  ),
});

export type GameStateSave = z.infer<typeof gameStateSaveSchema>;
```

**Usar en:** `src/app/api/game/save/route.ts`

```typescript
import { gameStateSaveSchema } from "@/lib/validations/game";

const result = gameStateSaveSchema.safeParse(gameState);
if (!result.success) {
  return NextResponse.json(
    { error: "Invalid game state", issues: result.error.flatten() },
    { status: 400 },
  );
}

const validatedState = result.data;
// ... continuar con guardado
```

---

### 4. Fix Passive Income Infinite Loop

**File:** `src/app/game/GameClient.tsx` (líneas 260-290)

```typescript
// ANTES (LOOP INFINITO):
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
        money: prev.money + prev.cps / 10,
      }));
      lastTime = now;
    }

    animationId = requestAnimationFrame(updatePassiveIncome);
  };

  animationId = requestAnimationFrame(updatePassiveIncome);
  return () => cancelAnimationFrame(animationId);
}, [gameState.cps]); // ← Problema: cada vez que gameState.cps cambia, reinicia

// DESPUES (CORRECTO):
const cpsRef = useRef<number>(0);

useEffect(() => {
  cpsRef.current = gameState.cps;
}, [gameState.cps]);

useEffect(() => {
  if (cpsRef.current === 0) return;

  let lastTime = Date.now();
  let animationId: number;
  let accumulatedMoney = 0;

  const updatePassiveIncome = () => {
    const now = Date.now();
    const deltaSeconds = (now - lastTime) / 1000;
    accumulatedMoney += cpsRef.current * deltaSeconds;

    if (accumulatedMoney >= 1) {
      const moneyToAdd = Math.floor(accumulatedMoney);
      setGameState((prev) => ({
        ...prev,
        money: prev.money + moneyToAdd,
      }));
      accumulatedMoney -= moneyToAdd;
      lastTime = now;
    }

    animationId = requestAnimationFrame(updatePassiveIncome);
  };

  animationId = requestAnimationFrame(updatePassiveIncome);
  return () => cancelAnimationFrame(animationId);
}, []); // ← Sin dependencias, solo ejecuta una vez
```

---

### 5. Fix Click Effect Memory Leak

**File:** `src/app/game/GameClient.tsx` (líneas 300-320)

```typescript
// AGREGAR:
const clickEffectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// REEMPLAZAR handlePokemonClick:
const handlePokemonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  try {
    // Limpiar timeout anterior
    if (clickEffectTimeoutRef.current) {
      clearTimeout(clickEffectTimeoutRef.current);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickEffect({ x, y, id: Math.random().toString() });

    clickEffectTimeoutRef.current = setTimeout(() => {
      setClickEffect(null);
      clickEffectTimeoutRef.current = null;
    }, 700);

    // ... resto del logic
  } catch (error) {
    console.error("Click handler error:", error);
  }
};

// AGREGAR cleanup en useEffect:
useEffect(() => {
  return () => {
    if (clickEffectTimeoutRef.current) {
      clearTimeout(clickEffectTimeoutRef.current);
    }
  };
}, []);
```

---

## MAYORES - Implementar en siguiente sprint (2-3 días)

### 6. Add Authentication Check for Session Changes

**File:** `src/app/game/GameClient.tsx`

```typescript
useEffect(() => {
  if (!session) {
    // Sesión perdida
    setGameState(getDefaultGameState());
    window.location.href = "/auth/login";
  }
}, [session]);
```

### 7. Fix Modal Event Listeners

**Files:** Todos los modales en `src/app/game/components/`

```typescript
// CAMBIAR:
}, [open, onClose]);

// A:
}, [open]);
```

### 8. Fix Shop Loading Loop

**File:** `src/app/game/components/Shop.tsx` (líneas 25-55)

Remover `itemImages` de dependencias del useEffect.

### 9. Add Timing Attack Prevention

**File:** `src/auth.ts`

```typescript
// Siempre hacer bcrypt aunque usuario no exista
const usuario = await prisma.usuario.findUnique({
  where: { email: credentials.email },
});

const dummyHash = "$2b$10$dummyhashvalue1234567890";
const hashToCompare = usuario?.password || dummyHash;

const isPasswordValid = await bcrypt.compare(
  credentials.password,
  hashToCompare,
);

if (!usuario || !isPasswordValid) {
  throw new Error("Credenciales inválidas");
}
```

### 10. Use Promise.allSettled instead of Promise.all

**File:** `src/app/game/GameClient.tsx` (líneas 120-145)

```typescript
const results = await Promise.allSettled(
  data.collectedPokemon.map(async (pokemon) => {
    if (pokemon.name && pokemon.image) return pokemon;
    const details = await getPokemonById(parseInt(pokemon.id));
    return {
      ...pokemon,
      name: details.name,
      image: details.image,
    };
  }),
);

const filledPokemon = results.map((result, idx) => {
  if (result.status === "fulfilled") return result.value;
  return data.collectedPokemon[idx];
});
```

---

## TESTING CHECKLIST

```bash
# Instalar dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Crear test files:
src/__tests__/GameClient.test.tsx
src/__tests__/api/game/save.test.ts
src/__tests__/api/auth/register.test.ts
src/__tests__/components/Shop.test.tsx

# Correr tests
npm run test
```

---

## DEPLOYMENT CHECKLIST

- [ ] Rate limiting configurado y testeado
- [ ] Validaciones Zod en lugar
- [ ] Race conditions arregladas
- [ ] Memory leaks removidos
- [ ] Tests pasando
- [ ] No hay console.log en producción
- [ ] CORS configurado correctamente
- [ ] Error handling en todos los endpoints
- [ ] Environment variables configuradas
- [ ] BD backed up antes de deploy
