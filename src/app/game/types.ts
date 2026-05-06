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
  rarity: "common" | "rare" | "epic" | "legendary";
  indiceSlot?: number | null; // 0-3 if displayed, null otherwise
  expuesto?: boolean; // Whether pokemon is displayed in expositor
}

export interface Pack {
  id: string;
  name: string;
  cost: number;
  emoji: string;
  probabilities: {
    common?: number;
    rare?: number;
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
    probabilities: { common: 80, rare: 18, legendary: 2 },
  },
  {
    id: "epic",
    name: "Sobre Épico",
    cost: 1000,
    emoji: "✨",
    probabilities: { common: 30, epic: 50, legendary: 20 },
  },
];

export const LEGENDARY_IDS = [
  144, 145, 146, 150, 151, 249, 250, 382, 383, 384, 487,
];
export const EPIC_IDS = [
  6, 9, 65, 94, 130, 143, 149, 248, 373, 376, 445, 448, 131,
];
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
  rare: "🟢 RARO",
  common: "⚪ COMÚN",
};

export function rollRarity(packId: string): CollectedPokemon["rarity"] {
  const roll = Math.random() * 100;
  if (packId === "basic") {
    if (roll < 2) return "legendary";
    if (roll < 20) return "rare";
    return "common";
  }
  if (roll < 20) return "legendary";
  if (roll < 70) return "epic";
  return "common";
}

export function pickPokemonId(rarity: CollectedPokemon["rarity"]): number {
  if (rarity === "legendary")
    return LEGENDARY_IDS[Math.floor(Math.random() * LEGENDARY_IDS.length)];
  if (rarity === "epic")
    return EPIC_IDS[Math.floor(Math.random() * EPIC_IDS.length)];
  if (rarity === "rare") return Math.floor(Math.random() * 100) + 152;
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
  if (pokemonId > 151) return "rare"; // Gen II and beyond
  return "common";
}
