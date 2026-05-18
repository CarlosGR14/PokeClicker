import { z } from "zod";
import { INITIAL_UPGRADES } from "@/app/game/types";

// Validar que los upgrade IDs sean conocidos (whitelist contra SQL injection)
const VALID_UPGRADE_IDS = new Set(INITIAL_UPGRADES.map((u) => u.id));

export const GameStateSchema = z.object({
  money: z
    .number()
    .min(0, "Money cannot be negative")
    .max(1e10, "Money value too high") // Más realista
    .finite("Money cannot be Infinity or NaN"),

  clicks: z
    .number()
    .min(0, "Clicks cannot be negative")
    .finite("Clicks cannot be Infinity or NaN"),

  cps: z
    .number()
    .min(0, "CPS cannot be negative")
    .max(1e6, "CPS value too high")
    .finite("CPS cannot be Infinity or NaN"),

  upgrades: z.array(
    z.object({
      // ID debe estar en la whitelist de upgrades válidos (previene SQL injection)
      id: z
        .string()
        .refine(
          (id) => VALID_UPGRADE_IDS.has(id),
          "Invalid upgrade ID - potential security issue",
        ),
      name: z.string().min(1).max(100),
      cost: z
        .number()
        .min(0, "Cost cannot be negative")
        .finite("Cost cannot be Infinity"),
      count: z
        .number()
        .int("Count must be an integer")
        .min(0, "Count cannot be negative")
        .max(10000, "Count exceeds maximum"),
      cpsBonus: z
        .number()
        .min(0, "CPS bonus cannot be negative")
        .finite("CPS bonus cannot be Infinity"),
      clickBonus: z
        .number()
        .min(0, "Click bonus cannot be negative")
        .optional(),
      description: z.string().min(1).max(200),
    }),
  ),

  collectedPokemon: z.array(
    z.object({
      id: z
        .string()
        .regex(
          /^\d+(?:_\d+)?$/,
          "Pokemon ID must be numeric or numeric_timestamp",
        ),
      name: z.string().min(1).max(100).optional(),
      image: z.string().url().or(z.literal("")).optional(),
      rarity: z.enum(["common", "epic", "legendary"]).optional(),
      cantidad: z.number().int("Cantidad must be integer").min(1).optional(),
      indiceSlot: z
        .number()
        .int("Slot must be integer")
        .min(0)
        .max(3)
        .nullable()
        .optional(),
      expuesto: z.boolean().optional(),
      pokeapi_id: z.number().int().min(1).optional(),
    }),
  ),
});

export type GameStateSave = z.infer<typeof GameStateSchema>;

export type ValidatedGameState = z.infer<typeof GameStateSchema>;
