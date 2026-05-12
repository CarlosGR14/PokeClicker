import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [prices, config] = await Promise.all([
      prisma.precioItem.findMany({
        orderBy: { tipo: "asc" },
      }),
      prisma.configGlobal.findUnique({
        where: { id: 1 },
      }),
    ]);

    return NextResponse.json({
      prices,
      config: config || { multiplicador_costo: 1.15 },
    });
  } catch (error) {
    console.error("Error fetching prices:", error);
    return NextResponse.json(
      { error: "Error al obtener precios" },
      { status: 500 },
    );
  }
}
