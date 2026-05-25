// Obtener datos de Pokémon desde PokeAPI

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const POKEMON_CACHE_DURATION = 3600000; // 1 hora en milisegundos
const cache = new Map<string, { data: unknown; timestamp: number }>();

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  height: number;
  weight: number;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

export interface PokemonSpecies {
  id: number;
  name: string;
  isBaby: boolean;
  isLegendary: boolean;
  isMythical: boolean;
}

export interface Item {
  id: number;
  name: string;
  image: string;
  category: string;
  cost: number;
  description: string;
}

// Devuelve un Pokémon al azar (entre 1 y 1025)
export async function getRandomPokemon(): Promise<Pokemon> {
  const randomId = Math.floor(Math.random() * 1025) + 1;
  return getPokemonById(randomId);
}

// Busca un Pokémon por ID o nombre
export async function getPokemonById(
  idOrName: number | string,
): Promise<Pokemon> {
  try {
    const cacheKey = `pokemon_${idOrName}`;

    // Ver si ya lo tenemos en caché
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < POKEMON_CACHE_DURATION) {
      return cached.data as Pokemon;
    }

    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${idOrName}`, {
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Pokémon: ${response.statusText}`);
    }

    const data = await response.json();

    const pokemon: Pokemon = {
      id: data.id,
      name: capitalizeFirstLetter(data.name),
      image:
        data.sprites.other?.["official-artwork"]?.front_default ||
        data.sprites.front_default ||
        "",
      height: data.height,
      weight: data.weight,
      types: data.types.map(
        (typeObj: { type: { name: string } }) => typeObj.type.name,
      ),
      stats: {
        hp:
          data.stats.find(
            (stat: { stat: { name: string } }) => stat.stat.name === "hp",
          )?.base_stat || 0,
        attack:
          data.stats.find(
            (stat: { stat: { name: string } }) => stat.stat.name === "attack",
          )?.base_stat || 0,
        defense:
          data.stats.find(
            (stat: { stat: { name: string } }) => stat.stat.name === "defense",
          )?.base_stat || 0,
        speed:
          data.stats.find(
            (stat: { stat: { name: string } }) => stat.stat.name === "speed",
          )?.base_stat || 0,
      },
    };

    // Guardar en caché
    cache.set(cacheKey, { data: pokemon, timestamp: Date.now() });

    return pokemon;
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
    throw error;
  }
}

/**
 * Get Pokémon species information (for rarity classification)
 */
export async function getPokemonSpecies(
  idOrName: number | string,
): Promise<PokemonSpecies> {
  try {
    const cacheKey = `species_${idOrName}`;

    // Ver si ya lo tenemos en caché
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < POKEMON_CACHE_DURATION) {
      return cached.data as PokemonSpecies;
    }

    const response = await fetch(
      `${POKEAPI_BASE_URL}/pokemon-species/${idOrName}`,
      { cache: "force-cache" },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch species: ${response.statusText}`);
    }

    const data = await response.json();

    const species: PokemonSpecies = {
      id: data.id,
      name: capitalizeFirstLetter(data.name),
      isBaby: data.is_baby,
      isLegendary: data.is_legendary,
      isMythical: data.is_mythical,
    };

    // Guardar en caché
    cache.set(cacheKey, { data: species, timestamp: Date.now() });

    return species;
  } catch (error) {
    console.error("Error fetching species:", error);
    throw error;
  }
}

/**
 * Determine rarity based on Pokémon species characteristics
 */
export async function determinePokemonRarity(
  pokemonId: number,
): Promise<"common" | "epic" | "legendary"> {
  try {
    const species = await getPokemonSpecies(pokemonId);

    if (species.isMythical) return "legendary";
    if (species.isLegendary) return "epic";

    // Probabilidad aleatoria para común/épico
    return Math.random() > 0.8 ? "epic" : "common";
  } catch {
    return "common";
  }
}

/**
 * Get multiple random Pokémon
 */
export async function getRandomPokemonBatch(count: number): Promise<Pokemon[]> {
  const promises = Array.from({ length: count }, () => getRandomPokemon());
  return Promise.all(promises);
}

/**
 * Get item by ID or name
 */
export async function getItemById(idOrName: number | string): Promise<Item> {
  try {
    const cacheKey = `item_${idOrName}`;

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < POKEMON_CACHE_DURATION) {
      return cached.data as Item;
    }

    const response = await fetch(`${POKEAPI_BASE_URL}/item/${idOrName}`, {
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch item: ${response.statusText}`);
    }

    const data = await response.json();

    const item: Item = {
      id: data.id,
      name: capitalizeFirstLetter(data.name),
      image: data.sprites?.default || "",
      category: data.category?.name || "misc",
      cost: data.cost || 0,
      description:
        data.flavor_text_entries?.find(
          (entry: { language: { name: string } }) =>
            entry.language.name === "en",
        )?.text || "",
    };

    cache.set(cacheKey, { data: item, timestamp: Date.now() });

    return item;
  } catch (error) {
    console.error("Error fetching item:", error);
    throw error;
  }
}

/**
 * Get items by category
 */
export async function getItemsByCategory(category: string): Promise<Item[]> {
  try {
    const cacheKey = `items_category_${category}`;

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < POKEMON_CACHE_DURATION) {
      return cached.data as Item[];
    }

    const response = await fetch(
      `${POKEAPI_BASE_URL}/item-category/${category}`,
      {
        cache: "force-cache",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.statusText}`);
    }

    const data = await response.json();

    const items: Item[] = await Promise.all(
      data.items.map(async (itemRef: { name: string }) =>
        getItemById(itemRef.name),
      ),
    );

    cache.set(cacheKey, { data: items, timestamp: Date.now() });

    return items;
  } catch (error) {
    console.error("Error fetching items by category:", error);
    throw error;
  }
}

/**
 * Get a list of shop items with limit
 */
export async function getShopItems(limit: number = 10): Promise<Item[]> {
  try {
    const response = await fetch(
      `${POKEAPI_BASE_URL}/item?limit=${limit}&offset=0`,
      {
        cache: "force-cache",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.statusText}`);
    }

    const data = await response.json();

    const items: Item[] = await Promise.all(
      data.results.map(async (itemRef: { name: string }) =>
        getItemById(itemRef.name),
      ),
    );

    return items;
  } catch (error) {
    console.error("Error fetching shop items:", error);
    throw error;
  }
}

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
}
