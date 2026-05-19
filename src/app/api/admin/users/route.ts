import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Verificar que sea admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        monedas: true,
        clicks: true,
        role: true,
        fecha_creacion: true,
      },
      orderBy: { fecha_creacion: "desc" },
    });

    // Convertir BigInt a string para JSON serialization
    const serializedUsers = users.map((user) => ({
      ...user,
      clicks: user.clicks.toString(),
    }));

    return NextResponse.json(serializedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
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

    const admin = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id, monedas, role } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 },
      );
    }

    const updateData: any = {};
    if (monedas !== undefined) updateData.monedas = Math.max(0, monedas);
    if (role !== undefined && ["admin", "jugador"].includes(role))
      updateData.role = role;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar" },
        { status: 400 },
      );
    }

    const updated = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        email: true,
        monedas: true,
        clicks: true,
        role: true,
        fecha_creacion: true,
      },
    });

    // Convertir BigInt a string
    return NextResponse.json({
      ...updated,
      clicks: updated.clicks.toString(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar que sea admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 },
      );
    }

    // Prevent deleting yourself
    if (admin.id === parseInt(id)) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 400 },
      );
    }

    await prisma.usuario.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true, message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 },
    );
  }
}
