import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

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

    const prices = await prisma.precioItem.findMany({
      orderBy: { tipo: "asc" },
    });
    return NextResponse.json(prices);
  } catch (error) {
    console.error("Error fetching prices:", error);
    return NextResponse.json(
      { error: "Error al obtener precios" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar que sea admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario || usuario.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id, precio_base, cps_bonus, click_bonus } = await request.json();

    if (!id || precio_base === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 },
      );
    }

    // Validar que sea número válido y positivo
    const precio = Number(precio_base);
    if (isNaN(precio) || precio < 0) {
      return NextResponse.json(
        { error: "Precio debe ser un número positivo" },
        { status: 400 },
      );
    }

    const updateData: any = { precio_base: precio };
    if (cps_bonus !== undefined) {
      const cpsNum = Number(cps_bonus);
      if (!isNaN(cpsNum)) updateData.cps_bonus = Math.max(0, cpsNum);
    }
    if (click_bonus !== undefined) {
      const clickNum = Number(click_bonus);
      if (!isNaN(clickNum)) updateData.click_bonus = Math.max(0, clickNum);
    }

    const updatedPrice = await prisma.precioItem.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(updatedPrice);
  } catch (error) {
    console.error("Error updating price:", error);
    return NextResponse.json(
      { error: "Error al actualizar precio" },
      { status: 500 },
    );
  }
}
