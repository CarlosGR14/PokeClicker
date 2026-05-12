import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y que sea admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const [totalUsers, usuariosData, totalPokemon] = await Promise.all([
      prisma.usuario.count(),
      prisma.usuario.aggregate({
        _sum: { monedas: true },
      }),
      prisma.pokemon.count(),
    ]);

    const totalCoins = usuariosData._sum.monedas || 0;

    // Obtener últimos 5 usuarios
    const recentUsers = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        fecha_creacion: true,
      },
      orderBy: { fecha_creacion: "desc" },
      take: 5,
    });

    return NextResponse.json({
      totalUsers,
      totalCoins,
      totalPokemon,
      recentUsers,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 },
    );
  }
}
