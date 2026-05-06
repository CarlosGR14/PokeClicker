import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

interface GameState {
  money: number;
  clicks: number;
  cps: number;
  upgrades: Array<{
    id: string;
    name: string;
    cost: number;
    count: number;
    cpsBonus: number;
    clickBonus?: number;
    description: string;
  }>;
  collectedPokemon: Array<{
    id: string;
    name: string;
    image: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    indiceSlot?: number | null;
  }>;
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    // Log para debugging
    console.log(
      "Save request - Session:",
      session?.user?.email || "No session",
    );
    console.log("Save request - Headers Host:", request.headers.get("host"));

    if (!session?.user?.email) {
      console.log("Save failed - No authenticated user");
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener cuerpo de la solicitud
    const gameState: GameState = await request.json();

    // Log del contenido recibido
    console.log("Save request - Money:", gameState.money);
    console.log("Save request - Clicks:", gameState.clicks);
    console.log("Save request - Upgrades count:", gameState.upgrades.length);
    console.log(
      "Save request - Pokemon count:",
      gameState.collectedPokemon.length,
    );

    // Validar datos
    if (
      typeof gameState.money !== "number" ||
      typeof gameState.clicks !== "number" ||
      typeof gameState.cps !== "number"
    ) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

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
        cps: gameState.cps,
        ultima_actualizacion: new Date(),
      },
    });

    // Actualizar Mejoras (upgrades)
    // Obtener mejoras existentes
    const mejorasExistentes = await prisma.mejora.findMany({
      where: { usuario_id: usuario.id },
    });

    for (const upgrade of gameState.upgrades) {
      const nombre = upgrade.name;
      const mejoraExistente = mejorasExistentes.find(
        (m) => m.nombre_item === nombre,
      );

      if (mejoraExistente) {
        // Actualizar si existe
        await prisma.mejora.update({
          where: { id: mejoraExistente.id },
          data: {
            cantidad: upgrade.count,
            precio_actual: upgrade.cost,
            valor_multiplicador: upgrade.cpsBonus,
            click_bonus: upgrade.clickBonus || 0,
          },
        });
      } else {
        // Crear si no existe
        await prisma.mejora.create({
          data: {
            usuario_id: usuario.id,
            nombre_item: nombre,
            cantidad: upgrade.count,
            precio_actual: upgrade.cost,
            valor_multiplicador: upgrade.cpsBonus,
            click_bonus: upgrade.clickBonus || 0,
          },
        });
      }
    }

    // Actualizar Pokémon (lo mantenemos simple - solo guarda que los capturó)
    // Los detalles como nombre e imagen se obtienen de PokeAPI en frontend
    for (const pokemon of gameState.collectedPokemon) {
      // pokemon.id is already the pokeapi_id
      const pokeapiId = parseInt(pokemon.id);

      // Determine if pokemon is exposed based on indiceSlot
      const isExposed =
        pokemon.indiceSlot !== null &&
        pokemon.indiceSlot !== undefined &&
        pokemon.indiceSlot >= 0 &&
        pokemon.indiceSlot < 4;

      // Verificar si ya existe este pokemon para este usuario
      const exists = await prisma.pokemon.findFirst({
        where: {
          usuario_id: usuario.id,
          pokeapi_id: pokeapiId,
        },
      });

      if (exists) {
        // Actualizar indiceSlot y expuesto
        await prisma.pokemon.update({
          where: { id: exists.id },
          data: {
            indiceSlot: pokemon.indiceSlot ?? null,
            expuesto: isExposed,
          },
        });
      } else {
        // Crear si no existe
        await prisma.pokemon.create({
          data: {
            usuario_id: usuario.id,
            pokeapi_id: pokeapiId,
            expuesto: isExposed,
            indiceSlot: pokemon.indiceSlot ?? null,
          },
        });
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
