import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const COST_MULTIPLIER = 1.15; // Multiplicador de precios global

export async function GET() {
  try {
    const prices = await prisma.precioItem.findMany({
      orderBy: { tipo: "asc" },
    });

    return NextResponse.json({
      prices,
      config: { multiplicador_costo: COST_MULTIPLIER },
    });
  } catch (error) {
    console.error("Error fetching prices:", error);
    return NextResponse.json(
      { error: "Error al obtener precios" },
      { status: 500 },
    );
  }
}
