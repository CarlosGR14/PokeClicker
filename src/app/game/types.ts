export interface GameState {
  money: number;
  clicks: number;
  cps: number;
  upgrades: Upgrade[];
  collectedPokemon: CollectedPokemon[];
}

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  count: number;
  cpsBonus: number;
  clickBonus?: number;
  description: string;
}

export interface CollectedPokemon {
  id: string;
  name: string;
  image: string;
  rarity: "common" | "epic" | "legendary";
  cantidad?: number; // Cantidad de este Pokémon
  indiceSlot?: number | null; // 0-3 si está visible, null si no
  expuesto?: boolean; // Si el Pokémon está visible en el expositor
  pokeapi_id?: number; // Adicional para compatibilidad
}

export interface Pack {
  id: string;
  name: string;
  cost: number;
  emoji: string;
  probabilities: {
    common?: number;
    epic?: number;
    legendary?: number;
  };
}

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: "pokeball",
    name: "Poké Ball",
    cost: 10,
    count: 0,
    cpsBonus: 0.1,
    description: "+0.1 por segundo",
  },
  {
    id: "greatball",
    name: "Great Ball",
    cost: 100,
    count: 0,
    cpsBonus: 1,
    description: "+1 por segundo",
  },
  {
    id: "ultraball",
    name: "Ultra Ball",
    cost: 1000,
    count: 0,
    cpsBonus: 10,
    description: "+10 por segundo",
  },
  {
    id: "masterball",
    name: "Master Ball",
    cost: 10000,
    count: 0,
    cpsBonus: 100,
    description: "+100 por segundo",
  },
  {
    id: "luckyPunch",
    name: "Lucky Punch",
    cost: 50,
    count: 0,
    cpsBonus: 0,
    clickBonus: 1,
    description: "+1 por clic",
  },
  {
    id: "focusBand",
    name: "Focus Band",
    cost: 500,
    count: 0,
    cpsBonus: 0,
    clickBonus: 5,
    description: "+5 por clic",
  },
  {
    id: "lifeorb",
    name: "Life Orb",
    cost: 5000,
    count: 0,
    cpsBonus: 0,
    clickBonus: 25,
    description: "+25 por clic",
  },
];

export const PACKS: Pack[] = [
  {
    id: "basic",
    name: "Sobre Básico",
    cost: 100,
    emoji: "📦",
    probabilities: { common: 85, epic: 13, legendary: 2 },
  },
  {
    id: "epic",
    name: "Sobre Épico",
    cost: 1000,
    emoji: "✨",
    probabilities: { common: 10, epic: 70, legendary: 20 },
  },
];

// IDs conocidos de Pokémon legendarios - para clasificar rareza
const KNOWN_LEGENDARY_IDS = new Set([
  // Gen 1
  144, 145, 146, 150, 151,
  // Gen 2
  249, 250, 251,
  // Gen 3
  377, 378, 379, 380, 381, 382, 383, 384, 385,
  // Gen 4
  480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
  // Gen 5
  638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
  // Gen 6
  716, 717, 718, 719, 720, 721,
  // Gen 7
  785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802,
  // Gen 8
  888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899,
  // Gen 9
  1000, 1001, 1002, 1003, 1004, 1005, 1006,
]);

// Clasifica rareza usando flags de PokeAPI, stats y nuestra lista de legendarios
export function classifyRarity(pokemon: any): CollectedPokemon["rarity"] {
  const id = pokemon.id;

  if (pokemon.is_legendary === true || pokemon.is_mythical === true) {
    return "legendary";
  }

  const baseStatTotal =
    pokemon.stats?.reduce(
      (sum: number, stat: any) => sum + stat.base_stat,
      0,
    ) ?? 0;
  if (baseStatTotal >= 600) {
    return "legendary";
  }

  if (KNOWN_LEGENDARY_IDS.has(id)) {
    return "legendary";
  }

  const captureRate = pokemon.capture_rate ?? 255;
  if (baseStatTotal >= 520 || captureRate < 50) {
    return "epic";
  }

  return "common";
}

let POKEMON_POOL: Map<"common" | "epic" | "legendary", number[]> | null = null;

export async function initializePokemonPool(): Promise<void> {
  if (POKEMON_POOL) return;

  POKEMON_POOL = new Map([
    ["common", []],
    ["epic", []],
    ["legendary", []],
  ]);

  try {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=1000",
    );
    const data = await response.json();

    for (const pokemonRef of data.results) {
      const id = parseInt(pokemonRef.url.split("/").slice(-2)[0]);
      const pokemonData = await fetch(pokemonRef.url).then((r) => r.json());
      const rarity = classifyRarity(pokemonData);
      POKEMON_POOL!.get(rarity)!.push(id);
    }
  } catch (error) {
    console.error("Failed to initialize Pokemon pool:", error);
    POKEMON_POOL.set(
      "common",
      Array.from({ length: 145 }, (_, i) => i + 1),
    );
    POKEMON_POOL.set("epic", [6, 9, 65, 94, 130, 131, 143, 149]);
    POKEMON_POOL.set("legendary", [144, 145, 146, 150, 151]);
  }
}

export const LEGENDARY_IDS = [144, 145, 146, 150, 151];

export const EPIC_IDS = [6, 9, 65, 94, 130, 131, 143, 149];

export const COMMON_IDS = Array.from({ length: 151 }, (_, i) => i + 1).filter(
  (id) => !LEGENDARY_IDS.includes(id) && !EPIC_IDS.includes(id),
);

export const UPGRADE_ICONS: Record<string, string> = {
  pokeball: "🔴",
  greatball: "🔵",
  ultraball: "⚫",
  masterball: "💜",
};

export const RARITY_LABELS: Record<string, string> = {
  legendary: "⭐ LEGENDARIO",
  epic: "💜 ÉPICO",
  common: "⚪ COMÚN",
};

export function rollRarity(packId: string): CollectedPokemon["rarity"] {
  const roll = Math.random() * 100;
  if (packId === "basic") {
    if (roll < 2) return "legendary";
    if (roll < 15) return "epic";
    return "common";
  }
  if (roll < 20) return "legendary";
  if (roll < 90) return "epic";
  return "common";
}

export function pickPokemonId(rarity: CollectedPokemon["rarity"]): number {
  if (POKEMON_POOL) {
    const pool = POKEMON_POOL.get(rarity);
    if (pool && pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  if (rarity === "legendary")
    return LEGENDARY_IDS[Math.floor(Math.random() * LEGENDARY_IDS.length)];
  if (rarity === "epic")
    return EPIC_IDS[Math.floor(Math.random() * EPIC_IDS.length)];

  return COMMON_IDS[Math.floor(Math.random() * COMMON_IDS.length)];
}

export function makeCaptureId(pokemonId: number): string {
  return `${pokemonId}_${Date.now()}`;
}

export function getRarityByPokemonId(
  pokemonId: number,
): CollectedPokemon["rarity"] {
  if (LEGENDARY_IDS.includes(pokemonId)) return "legendary";
  if (EPIC_IDS.includes(pokemonId)) return "epic";
  return "common";
}

// ============================================
// AUTOMATIC RARITY DETECTION (using PokeAPI)
// ============================================

const rarityCache = new Map<number, CollectedPokemon["rarity"]>();
let isCachingInProgress = false;
let pendingCacheUpdates = new Set<number>();

// Lee caché de rareza desde localStorage si existe
function initializeClientCache(): void {
  if (typeof window === "undefined") return;

  try {
    const cached = localStorage.getItem("pokeclicker_rarity_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      Object.entries(parsed).forEach(([id, rarity]) => {
        rarityCache.set(Number(id), rarity as CollectedPokemon["rarity"]);
      });
    }
  } catch (error) {
    console.warn("Failed to load rarity cache from localStorage", error);
  }
}

// Guarda caché de rareza en localStorage para la próxima sesión
function persistCacheToLocalStorage(): void {
  if (typeof window === "undefined") return;

  try {
    const cacheObj: Record<number, CollectedPokemon["rarity"]> = {};
    rarityCache.forEach((rarity, id) => {
      cacheObj[id] = rarity;
    });

    localStorage.setItem("pokeclicker_rarity_cache", JSON.stringify(cacheObj));
  } catch (error) {
    console.warn("Failed to persist rarity cache to localStorage", error);
  }
}

// Obtiene rareza de PokeAPI con caché local para no repetir requests
export async function getRarityByPokemonIdAuto(
  pokemonId: number,
): Promise<CollectedPokemon["rarity"]> {
  if (rarityCache.has(pokemonId)) {
    return rarityCache.get(pokemonId)!;
  }

  try {
    const { determinePokemonRarity } = await import("@/services/pokeapi");
    const rarity = await determinePokemonRarity(pokemonId);

    rarityCache.set(pokemonId, rarity);
    persistCacheToLocalStorage();
    return rarity;
  } catch (error) {
    console.warn(
      `Failed to determine rarity for Pokemon ${pokemonId}, using sync version`,
      error,
    );
    const fallbackRarity = getRarityByPokemonId(pokemonId);
    rarityCache.set(pokemonId, fallbackRarity);
    persistCacheToLocalStorage();
    return fallbackRarity;
  }
}

// Elige Pokémon aleatorio con rareza exacta (más lento pero más preciso)
export async function pickPokemonIdAuto(
  rarity: CollectedPokemon["rarity"],
): Promise<number> {
  const maxAttempts = 50;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const pokemonId = Math.floor(Math.random() * 1025) + 1;
    const actualRarity = await getRarityByPokemonIdAuto(pokemonId);

    if (actualRarity === rarity) {
      return pokemonId;
    }

    attempts++;
  }

  console.warn(
    `No encontré Pokémon ${rarity} en ${maxAttempts} intentos, usando versión síncrona`,
  );
  return pickPokemonId(rarity);
}

// Precalienta caché de rareza sin bloquear - encola updates si ya está en progreso
export function warmRarityCache(pokemonIds: number[]): void {
  if (isCachingInProgress) {
    pokemonIds.forEach((id) => pendingCacheUpdates.add(id));
    return;
  }

  const toUpdate = pokemonIds.filter(
    (id) => !rarityCache.has(id) && !pendingCacheUpdates.has(id),
  );

  if (toUpdate.length === 0) return;

  isCachingInProgress = true;

  (async () => {
    for (const pokemonId of toUpdate) {
      try {
        await getRarityByPokemonIdAuto(pokemonId);
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Failed to warm cache for Pokemon ${pokemonId}`, error);
      }
    }

    isCachingInProgress = false;

    if (pendingCacheUpdates.size > 0) {
      const pending = Array.from(pendingCacheUpdates);
      pendingCacheUpdates.clear();
      warmRarityCache(pending);
    }
  })();
}

// Precalienta Gen 1 al iniciar (más común)
export async function preWarmGen1Cache(): Promise<void> {
  const gen1Ids = Array.from({ length: 151 }, (_, i) => i + 1);
  const notCached = gen1Ids.filter((id) => !rarityCache.has(id));

  if (notCached.length > 0) {
    warmRarityCache(notCached);
  }
}

// Limpia caché (útil para testing o refrescar manualmente)
export function clearRarityCache(): void {
  rarityCache.clear();
  if (typeof window !== "undefined") {
    localStorage.removeItem("pokeclicker_rarity_cache");
  }
}

if (typeof window !== "undefined") {
  initializeClientCache();
}
