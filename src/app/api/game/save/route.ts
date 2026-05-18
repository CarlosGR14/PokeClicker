import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { GameStateSchema } from "@/lib/validations/gameState";
import {
  rateLimitMiddleware,
  RATE_LIMIT_CONFIGS,
  getIdentifier,
} from "@/lib/middleware/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log("Save failed - No authenticated user");
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Rate limiting - usa identificador por email (más específico que IP)
    const ip = session.user.email;
    const identifier = getIdentifier(request);
    const key = `save:${ip}`;

    const now = Date.now();
    const rateLimitData = (global as any).rateLimitStore || {};

    // Usar store global
    (global as any).rateLimitStore = rateLimitData;

    const { maxRequests: maxSaves, windowMs: savesWindowMs } =
      RATE_LIMIT_CONFIGS.GAME_SAVE;

    if (!rateLimitData[key] || now > rateLimitData[key].resetTime) {
      rateLimitData[key] = { count: 0, resetTime: now + savesWindowMs };
    }

    if (rateLimitData[key].count >= maxSaves) {
      const retryAfter = Math.ceil((rateLimitData[key].resetTime - now) / 1000);
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Max saves per minute reached.",
          retryAfter,
        },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() },
        },
      );
    }

    rateLimitData[key].count++;

    // Log para debugging
    console.log(
      "Save request - Session:",
      session?.user?.email || "No session",
    );
    console.log("Save request - Headers Host:", request.headers.get("host"));

    // Obtener cuerpo de la solicitud
    const rawGameState = await request.json();
    console.log(
      "Raw game state received:",
      JSON.stringify(rawGameState, null, 2),
    );

    // Validar con Zod - Strict validation para security
    const validationResult = GameStateSchema.safeParse(rawGameState);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      console.error(
        "Validation failed - Field Errors:",
        JSON.stringify(errors.fieldErrors, null, 2),
      );
      console.error(
        "Validation failed - General Errors:",
        JSON.stringify(errors.formErrors, null, 2),
      );
      return NextResponse.json(
        {
          error: "Invalid game state",
          issues: errors.fieldErrors,
          formErrors: errors.formErrors,
        },
        { status: 400 },
      );
    }

    const gameState = validationResult.data;

    // Log del contenido recibido
    console.log("Save request validated - Money:", gameState.money);
    console.log(
      "Save request validated - Upgrades count:",
      gameState.upgrades.length,
    );
    console.log(
      "Save request validated - Pokemon count:",
      gameState.collectedPokemon.length,
    );

    // Obtener usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Actualizar Usuario con estado del juego
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        monedas: gameState.money,
        clicks: BigInt(Math.floor(gameState.clicks)),
        ultima_actualizacion: new Date(),
      },
    });

    // Actualizar Mejoras (upgrades) - Vincular a PrecioItem usando nombre estandarizado desde upgrade.name
    const mejorasExistentes = await prisma.mejora.findMany({
      where: { usuario_id: usuario.id },
      include: { precioItem: true },
    });

    // Mapear por nombre de precioItem para búsqueda rápida
    const mejorasMap = new Map(
      mejorasExistentes.map((m) => [m.precioItem.nombre, m.id]),
    );

    // Obtener todos los PrecioItems para mapeo
    const precioItems = await prisma.precioItem.findMany();
    const precioItemMap = new Map(precioItems.map((p) => [p.nombre, p]));

    // Separar upgrades en updates y creates
    // IMPORTANTE: Usar upgrade.name como clave (ya fue validado por Zod con IDs válidos)
    const upgradesToUpdate = [];
    const upgradesToCreate = [];

    for (const upgrade of gameState.upgrades) {
      // El nombre ya está validado por Zod schema
      const nombre = upgrade.name;
      const precioItem = precioItemMap.get(nombre);

      if (!precioItem) {
        console.warn(`PrecioItem not found for upgrade: ${nombre}`);
        continue;
      }

      const data = {
        cantidad: upgrade.count,
        precio_pagado: upgrade.cost,
      };

      if (mejorasMap.has(nombre)) {
        upgradesToUpdate.push({
          id: mejorasMap.get(nombre)!,
          data,
        });
      } else {
        upgradesToCreate.push({
          usuario_id: usuario.id,
          precio_item_id: precioItem.id,
          cantidad: upgrade.count,
          precio_pagado: upgrade.cost,
        });
      }
    }

    // Ejecutar batch operations
    const updatePromises = upgradesToUpdate.map((item: any) =>
      prisma.mejora.update({
        where: { id: item.id },
        data: item.data,
      }),
    );

    if (upgradesToCreate.length > 0) {
      await prisma.mejora.createMany({
        data: upgradesToCreate,
        skipDuplicates: true,
      });
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    // Actualizar Pokémon de forma optimizada
    if (gameState.collectedPokemon.length > 0) {
      // Extraer pokemonId del formato "pokemonId_timestamp" o solo "pokemonId"
      const pokemonIds = gameState.collectedPokemon
        .map((p: any) => {
          const match = p.id.match(/^(\d+)/);
          return match ? parseInt(match[1]) : null;
        })
        .filter((id: any): id is number => id !== null);

      // Obtener TODOS los Pokémon existentes del usuario (puede haber duplicados)
      const allExistingPokemon = await prisma.pokemon.findMany({
        where: {
          usuario_id: usuario.id,
          pokeapi_id: { in: pokemonIds },
        },
      });

      // CONSOLIDATE: Group by pokeapi_id and merge quantities
      const consolidatedMap = new Map<
        number,
        {
          totalQuantidad: number;
          records: (typeof allExistingPokemon)[0][];
        }
      >();

      for (const pokemon of allExistingPokemon) {
        const existing = consolidatedMap.get(pokemon.pokeapi_id);
        if (existing) {
          existing.totalQuantidad += pokemon.cantidad;
          existing.records.push(pokemon);
        } else {
          consolidatedMap.set(pokemon.pokeapi_id, {
            totalQuantidad: pokemon.cantidad,
            records: [pokemon],
          });
        }
      }

      // DELETE duplicates: for each pokeapi_id with multiple records, keep only the first
      const deleteDuplicatePromises = [];
      for (const [, { records }] of consolidatedMap.entries()) {
        if (records.length > 1) {
          // Delete all except the first one
          const toDelete = records.slice(1);
          for (const pokemon of toDelete) {
            deleteDuplicatePromises.push(
              prisma.pokemon.delete({ where: { id: pokemon.id } }),
            );
          }
        }
      }

      if (deleteDuplicatePromises.length > 0) {
        console.log(
          `Cleaning up ${deleteDuplicatePromises.length} duplicate Pokemon records...`,
        );
        await Promise.all(deleteDuplicatePromises);
      }

      // Now get the clean single record for each pokeapi_id
      const existingPokemon = await prisma.pokemon.findMany({
        where: {
          usuario_id: usuario.id,
          pokeapi_id: { in: pokemonIds },
        },
      });

      const existingMap = new Map(
        existingPokemon.map((p) => [p.pokeapi_id, p]),
      );

      // Preparar operaciones de upsert
      const upsertPromises = gameState.collectedPokemon
        .map((pokemon: any) => {
          // Extract pokemonId from format "pokemonId_timestamp" (new capture) or solo "pokemonId" (from DB)
          const match = pokemon.id.match(/^(\d+)(?:_(\d+))?$/);

          if (!match) {
            console.warn(`Invalid Pokemon ID format: ${pokemon.id}`);
            return null;
          }

          const pokeapiId = parseInt(match[1]);
          const timestamp = match[2]; // undefined if not present
          const isNew = !!timestamp; // is new if has timestamp

          if (existingMap.has(pokeapiId)) {
            // Update: set exact quantity from client (client has consolidated state)
            const existingRecord = existingMap.get(pokeapiId)!;
            const data: any = {
              indiceSlot: pokemon.indiceSlot ?? null,
              cantidad: pokemon.cantidad, // Use exact amount from client
            };

            return prisma.pokemon.update({
              where: { id: existingRecord.id },
              data,
            });
          } else {
            // Create (only if NEW, is a new capture)
            if (!isNew) {
              console.warn(
                `Pokemon ${pokeapiId} no existe y no es nuevo, ignorando`,
              );
              return null;
            }

            return prisma.pokemon.create({
              data: {
                usuario_id: usuario.id,
                pokeapi_id: pokeapiId,
                cantidad: pokemon.cantidad, // Use exact quantity from client
                indiceSlot: pokemon.indiceSlot ?? null,
              },
            });
          }
        })
        .filter((p: any) => p !== null);

      // Ejecutar todas las operaciones en paralelo
      if (upsertPromises.length > 0) {
        await Promise.all(upsertPromises);
      }
    }

    return NextResponse.json(
      { success: true, message: "Juego guardado correctamente" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al guardar el juego:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
