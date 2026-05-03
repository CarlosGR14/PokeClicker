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
        mejoras: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Mapear datos a GameState
    // Asegurar que money, clicks y cps nunca sean undefined
    const gameState = {
      money: usuario.monedas || 0,
      clicks: Number(usuario.clicks) || 0,
      cps: usuario.cps || 0,
      upgrades: usuario.mejoras.map((mejora) => {
        const cpsBonus = mejora.valor_multiplicador || 0;
        const clickBonus = mejora.click_bonus || 0;

        return {
          id: mejora.nombre_item
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .replace(/\s+/g, ""),
          name: mejora.nombre_item,
          cost: mejora.precio_actual || 0,
          count: mejora.cantidad || 0,
          cpsBonus,
          clickBonus: clickBonus > 0 ? clickBonus : undefined,
          description:
            clickBonus > 0
              ? `+${clickBonus} por clic`
              : `+${cpsBonus} por segundo`,
        };
      }),
      collectedPokemon: usuario.pokemons.map((pokemon) => ({
        id: `${pokemon.pokeapi_id}`, // Use pokeapi_id as the unique identifier
        name: "", // Se llena en frontend con PokeAPI
        image: "", // Se llena en frontend con PokeAPI
        rarity: getRarityByPokemonId(pokemon.pokeapi_id),
        indiceSlot: pokemon.indiceSlot,
        expuesto: pokemon.expuesto,
      })),
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
