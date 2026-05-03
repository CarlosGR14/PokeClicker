import { serverRegisterSchema } from "@/lib/validations/auth";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Body recibido:", body);

    // Validar con Zod (schema del servidor)
    const result = serverRegisterSchema.safeParse(body);
    if (!result.success) {
      console.log("Error de validación:", result.error.issues);
      return NextResponse.json(
        { error: "Validación fallida", issues: result.error.issues },
        { status: 400 },
      );
    }

    const { email, password, name } = result.data;
    console.log("Datos validados:", { email, name });

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Usuario ya existe:", email);
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 },
      );
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Contraseña hasheada");

    // Crear usuario en base de datos
    const user = await prisma.usuario.create({
      data: {
        email,
        nombre: name,
        password: hashedPassword,
      },
    });

    console.log("Usuario creado:", user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          id: user.id,
          email: user.email,
          name: user.nombre,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error detallado:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error interno: ${errorMessage}` },
      { status: 500 },
    );
  }
}
