import { z } from "zod";

export const GameStateSchema = z.object({
  money: z
    .number()
    .min(0, "Money cannot be negative")
    .max(1e15, "Money value too high"), // Prevent overflow
  clicks: z
    .number()
    .min(0, "Clicks cannot be negative")
    .max(1e15, "Clicks value too high"),
  cps: z
    .number()
    .min(0, "CPS cannot be negative")
    .max(1e6, "CPS value too high"),
  upgrades: z.array(
    z.object({
      id: z.string(),
      name: z.enum([
        "Poké Ball",
        "Great Ball",
        "Ultra Ball",
        "Master Ball",
        "Lucky Punch",
        "Focus Band",
        "Life Orb",
      ]), // Only known upgrade names
      cost: z.number().positive(),
      count: z.number().nonnegative(),
      cpsBonus: z.number().nonnegative(),
      clickBonus: z.number().nonnegative().optional(),
      description: z.string(),
    }),
  ),
  collectedPokemon: z.array(
    z.object({
      id: z
        .string()
        .regex(
          /^\d+_\d+$/,
          "Pokemon ID must be in format: pokemonId_timestamp",
        ), // Format: pokemonId_timestamp
      name: z.string().optional(), // From client, not stored
      image: z.string().optional(), // From client, not stored
      rarity: z.enum(["common", "epic", "legendary"]).optional(), // From client, not stored
      indiceSlot: z.number().min(0).max(3).nullable().optional(),
    }),
  ),
});

export type ValidatedGameState = z.infer<typeof GameStateSchema>;
