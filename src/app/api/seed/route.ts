import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    console.log("🌱 Iniciando seed de PrecioItems...");

    // Mejoras (bolas y punches)
    const mejoras = [
      {
        nombre: "Poké Ball",
        tipo: "mejora",
        precio_base: 10,
        cps_bonus: 0.1,
        click_bonus: 0,
      },
      {
        nombre: "Great Ball",
        tipo: "mejora",
        precio_base: 100,
        cps_bonus: 1,
        click_bonus: 0,
      },
      {
        nombre: "Ultra Ball",
        tipo: "mejora",
        precio_base: 1000,
        cps_bonus: 10,
        click_bonus: 0,
      },
      {
        nombre: "Master Ball",
        tipo: "mejora",
        precio_base: 10000,
        cps_bonus: 100,
        click_bonus: 0,
      },
      {
        nombre: "Lucky Punch",
        tipo: "mejora",
        precio_base: 50,
        cps_bonus: 0,
        click_bonus: 1,
      },
      {
        nombre: "Focus Band",
        tipo: "mejora",
        precio_base: 500,
        cps_bonus: 0,
        click_bonus: 5,
      },
      {
        nombre: "Life Orb",
        tipo: "mejora",
        precio_base: 5000,
        cps_bonus: 0,
        click_bonus: 25,
      },
    ];

    // Sobres (packs)
    const sobres = [
      {
        nombre: "Sobre Básico",
        tipo: "sobre",
        precio_base: 100,
        cps_bonus: 0,
        click_bonus: 0,
      },
      {
        nombre: "Sobre Épico",
        tipo: "sobre",
        precio_base: 1000,
        cps_bonus: 0,
        click_bonus: 0,
      },
    ];

    const allItems = [...mejoras, ...sobres];
    const results = [];

    for (const item of allItems) {
      const existing = await prisma.precioItem.findUnique({
        where: { nombre: item.nombre },
      });

      if (!existing) {
        const created = await prisma.precioItem.create({
          data: {
            nombre: item.nombre,
            tipo: item.tipo as any,
            precio_base: item.precio_base,
            cps_bonus: item.cps_bonus,
            click_bonus: item.click_bonus,
            activo: true,
          },
        });
        results.push({ status: "created", item: item.nombre });
        console.log(`✅ Creado: ${item.nombre}`);
      } else {
        results.push({ status: "exists", item: item.nombre });
        console.log(`⏭️  Ya existe: ${item.nombre}`);
      }
    }

    return NextResponse.json(
      { success: true, message: "Seed completado", results },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Error en seed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
