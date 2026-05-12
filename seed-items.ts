import { prisma } from "./src/lib/db";

async function seedPrecioItems() {
  try {
    console.log("🌱 Insertando PrecioItems...\n");

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

    for (const item of allItems) {
      const existing = await prisma.precioItem.findUnique({
        where: { nombre: item.nombre },
      });

      if (!existing) {
        await prisma.precioItem.create({
          data: {
            nombre: item.nombre,
            tipo: item.tipo as any,
            precio_base: item.precio_base,
            cps_bonus: item.cps_bonus,
            click_bonus: item.click_bonus,
            activo: true,
          },
        });
        console.log(`✅ Creado: ${item.nombre}`);
      } else {
        console.log(`⏭️  Ya existe: ${item.nombre}`);
      }
    }

    console.log("\n✨ PrecioItems insertados correctamente");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPrecioItems();
