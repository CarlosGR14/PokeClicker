import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getRarityByPokemonId } from "@/app/game/types";

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener usuario con relaciones
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      include: {
        pokemons: {
          orderBy: { fecha_captura: "desc" },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Obtener mejoras del usuario con precios actuales
    const mejoras = await prisma.mejora.findMany({
      where: { usuario_id: usuario.id },
      include: { precioItem: true },
    });

    // Multiplicador de precios global
    const multiplicador = 1.15;

    // Mapear datos a GameState
    // Asegurar que money, clicks y cps nunca sean undefined
    const UPGRADE_ID_MAP: Record<string, string> = {
      "Poké Ball": "pokeball",
      "Great Ball": "greatball",
      "Ultra Ball": "ultraball",
      "Master Ball": "masterball",
      "Lucky Punch": "luckyPunch",
      "Focus Band": "focusBand",
      "Life Orb": "lifeorb",
    };

    // Obtener todos los precios actuales de una vez (optimización)
    const preciosItems = await prisma.precioItem.findMany();
    const preciosMap = new Map(
      preciosItems.map((p) => [p.nombre, p.precio_base]),
    );

    const upgrades = mejoras.map((mejora) => {
      const cpsBonus = mejora.precioItem?.cps_bonus || 0;
      const clickBonus = mejora.precioItem?.click_bonus || 0;
      const cantidad = mejora.cantidad || 0;

      // Usar precio_base actual de PrecioItem
      const precioBase = mejora.precioItem?.precio_base || 0;

      // Calcular precio dinámico: precio_base * multiplicador^cantidad
      const precioDinamico = Math.floor(
        precioBase * Math.pow(multiplicador, cantidad),
      );

      return {
        id:
          UPGRADE_ID_MAP[mejora.precioItem?.nombre || ""] ||
          mejora.precioItem?.nombre?.toLowerCase().replace(/\s+/g, "") ||
          "",
        name: mejora.precioItem?.nombre || "",
        cost: precioDinamico,
        count: cantidad,
        cpsBonus,
        clickBonus: clickBonus > 0 ? clickBonus : undefined,
        description:
          clickBonus > 0
            ? `+${clickBonus} por clic`
            : `+${cpsBonus} por segundo`,
      };
    });

    // Recalcular cps basado en mejoras actuales
    const calculatedCps = upgrades.reduce((total, upgrade) => {
      return total + upgrade.cpsBonus * upgrade.count;
    }, 0);

    const gameState = {
      money: usuario.monedas || 0,
      clicks: Number(usuario.clicks) || 0,
      cps: calculatedCps,
      upgrades,
      collectedPokemon: (() => {
        // Agrupar Pokémon por pokeapi_id para evitar duplicados
        // Sumar cantidades de todos los registros del mismo Pokémon
        const consolidatedMap = new Map<
          number,
          {
            totalQuantidad: number;
            indiceSlot: number | null;
            latestRecord: (typeof usuario.pokemons)[0];
          }
        >();

        for (const pokemon of usuario.pokemons) {
          const existing = consolidatedMap.get(pokemon.pokeapi_id);
          if (existing) {
            // Sumar cantidades de todos los registros del mismo pokeapi_id
            existing.totalQuantidad += pokemon.cantidad || 1;
            // Mantener slot del primer registro que lo tenga (no sobrescribir)
            if (existing.indiceSlot === null && pokemon.indiceSlot !== null) {
              existing.indiceSlot = pokemon.indiceSlot;
            }
            // Guardar el registro más reciente para metadatos
            if (pokemon.fecha_captura > existing.latestRecord.fecha_captura) {
              existing.latestRecord = pokemon;
            }
          } else {
            consolidatedMap.set(pokemon.pokeapi_id, {
              totalQuantidad: pokemon.cantidad || 1,
              indiceSlot: pokemon.indiceSlot,
              latestRecord: pokemon,
            });
          }
        }

        // Convertir consolidated map a array de Pokemon
        return Array.from(consolidatedMap.entries()).map(
          ([pokeapi_id, data]) => ({
            id: `${pokeapi_id}`, // Usar pokeapi_id como identificador único
            name: "", // Se llena en frontend con PokeAPI
            image: "", // Se llena en frontend con PokeAPI
            rarity:
              (data.latestRecord.rarity as "common" | "epic" | "legendary") ||
              "common",
            cantidad: data.totalQuantidad, // Usar cantidad sumada
            indiceSlot: data.indiceSlot,
            expuesto:
              data.indiceSlot !== null &&
              data.indiceSlot >= 0 &&
              data.indiceSlot < 4,
            pokeapi_id,
          }),
        );
      })(),
    };

    return NextResponse.json(gameState, { status: 200 });
  } catch (error) {
    console.error("Error al obtener estado del juego:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
