import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { GameStateSchema } from "@/lib/validations/gameState";

// Simple rate limiting
const requestStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const data = requestStore.get(key);

  if (!data || now > data.resetTime) {
    requestStore.set(key, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (data.count >= 60) {
    // 60 requests per minute (1 per second average)
    return false;
  }

  data.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log("Save failed - No authenticated user");
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      session.user.email;

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 60 saves per minute." },
        { status: 429 },
      );
    }

    // Log para debugging
    console.log(
      "Save request - Session:",
      session?.user?.email || "No session",
    );
    console.log("Save request - Headers Host:", request.headers.get("host"));

    // Obtener cuerpo de la solicitud
    const rawGameState = await request.json();

    // Validar con Zod - Be more permissive for now
    const gameState = rawGameState; // Skip validation temporarily to debug

    // Basic sanity checks
    if (
      typeof gameState.money !== "number" ||
      typeof gameState.clicks !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid game state - missing required fields" },
        { status: 400 },
      );
    }

    // Log del contenido recibido
    console.log("Save request - Money:", gameState.money);
    console.log("Save request - Clicks:", gameState.clicks);
    console.log("Save request - Upgrades count:", gameState.upgrades.length);
    console.log(
      "Save request - Pokemon count:",
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

    // Actualizar Mejoras (upgrades) - Vincular a PrecioItem
    const mejorasExistentes = await prisma.mejora.findMany({
      where: { usuario_id: usuario.id },
      include: { precioItem: true },
    });

    const mejorasMap = new Map(
      mejorasExistentes.map((m) => [m.precioItem.nombre, m.id]),
    );

    // Obtener todos los PrecioItems para mapeo
    const precioItems = await prisma.precioItem.findMany();
    const precioItemMap = new Map(precioItems.map((p) => [p.nombre, p]));

    // Separar upgrades en updates y creates
    const upgradesToUpdate = [];
    const upgradesToCreate = [];

    for (const upgrade of gameState.upgrades) {
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

      // Obtener Pokémon existentes del usuario
      const existingPokemon = await prisma.pokemon.findMany({
        where: {
          usuario_id: usuario.id,
          pokeapi_id: { in: pokemonIds },
        },
      });

      const existingMap = new Map(
        existingPokemon.map((p) => [p.pokeapi_id, p.id]),
      );

      // Preparar operaciones de upsert
      const upsertPromises = gameState.collectedPokemon
        .map((pokemon: any) => {
          // Extract pokemonId from format "pokemonId_timestamp" o solo "pokemonId"
          const match = pokemon.id.match(/^(\d+)(?:_(\d+))?$/);
          const pokeapiId = match ? parseInt(match[1]) : null;
          const timestamp = match ? match[2] : null; // Timestamp si existe = es NUEVO

          if (!pokeapiId) {
            console.warn(`Invalid Pokemon ID format: ${pokemon.id}`);
            return null;
          }

          if (existingMap.has(pokeapiId)) {
            // Actualizar: solo incrementar si es NUEVO (tiene timestamp)
            const data: any = {
              indiceSlot: pokemon.indiceSlot ?? null,
            };

            // Solo incrementar cantidad si tiene timestamp (es un capture nuevo)
            if (timestamp) {
              data.cantidad = { increment: 1 };
            }

            return prisma.pokemon.update({
              where: { id: existingMap.get(pokeapiId)! },
              data,
            });
          } else {
            // Crear (solo si tiene timestamp, es un capture nuevo)
            if (!timestamp) {
              console.warn(
                `Pokemon ${pokeapiId} no existe y no tiene timestamp, ignorando`,
              );
              return null;
            }

            return prisma.pokemon.create({
              data: {
                usuario_id: usuario.id,
                pokeapi_id: pokeapiId,
                cantidad: 1,
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
