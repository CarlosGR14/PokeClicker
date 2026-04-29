/**
 * PokeAPI Service
 * Fetches Pokémon data from the official PokeAPI
 */

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const POKEMON_CACHE_DURATION = 3600000; // 1 hour in milliseconds
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

/**
 * Get a random Pokémon
 * Returns a Pokémon with ID between 1 and 1025
 */
export async function getRandomPokemon(): Promise<Pokemon> {
  const randomId = Math.floor(Math.random() * 1025) + 1;
  return getPokemonById(randomId);
}

/**
 * Get Pokémon by ID or name
 */
export async function getPokemonById(
  idOrName: number | string,
): Promise<Pokemon> {
  try {
    const cacheKey = `pokemon_${idOrName}`;

    // Check cache
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

    // Cache the result
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

    // Check cache
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

    // Cache the result
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
): Promise<"common" | "rare" | "epic" | "legendary"> {
  try {
    const species = await getPokemonSpecies(pokemonId);

    if (species.isMythical) return "legendary";
    if (species.isLegendary) return "epic";
    if (species.isBaby) return "rare";

    // Random chance for common/rare
    return Math.random() > 0.8 ? "rare" : "common";
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
