import { prisma } from "./src/lib/db";
import bcrypt from "bcrypt";

async function seedAdmin() {
  try {
    console.log("👨‍💼 Creando usuario admin...\n");

    const adminEmail = "admin@pokeclicker.com";
    const adminPassword = "Admin123!";
    const saltRounds = 10;

    // Verificar si el admin ya existe
    const existingAdmin = await prisma.usuario.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`⏭️  Usuario admin ya existe: ${adminEmail}`);
      return;
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Crear usuario admin
    const admin = await prisma.usuario.create({
      data: {
        email: adminEmail,
        nombre: "Administrador",
        password: hashedPassword,
        role: "admin",
        monedas: 1000000, // Darle monedas iniciales
        clicks: 0,
        tema: "system",
      },
    });

    console.log(`✅ Usuario admin creado exitosamente`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Contraseña: ${adminPassword}`);
    console.log(
      `⚠️  Por seguridad, cambia esta contraseña en el primer login\n`,
    );
  } catch (error) {
    console.error("❌ Error creando admin:", error);
  }
}

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
  }
}

async function main() {
  try {
    console.log("🌱 Iniciando seeding de base de datos...\n");
    console.log("═".repeat(50));
    await seedAdmin();
    console.log("═".repeat(50));
    await seedPrecioItems();
    console.log("═".repeat(50));
    console.log("\n✨ Seeding completado exitosamente\n");
  } catch (error) {
    console.error("❌ Error durante seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
