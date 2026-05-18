import { serverRegisterSchema } from "@/lib/validations/auth";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getIdentifier, RATE_LIMIT_CONFIGS } from "@/lib/middleware/rateLimit";

/**
 * POST /api/auth/register
 * Registra un nuevo usuario en la plataforma
 *
 * @param request - Solicitud con body: { email, password, name }
 * @returns Usuario creado o error específico
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - previene diccionario attacks
    const identifier = getIdentifier(request);
    const key = `register:${identifier}`;
    const now = Date.now();

    const rateLimitData = (global as any).rateLimitStore || {};
    (global as any).rateLimitStore = rateLimitData;

    const { maxRequests: maxAttempts, windowMs: authWindowMs } =
      RATE_LIMIT_CONFIGS.AUTH;

    if (!rateLimitData[key] || now > rateLimitData[key].resetTime) {
      rateLimitData[key] = { count: 0, resetTime: now + authWindowMs };
    }

    if (rateLimitData[key].count >= maxAttempts) {
      const retryAfter = Math.ceil((rateLimitData[key].resetTime - now) / 1000);
      return NextResponse.json(
        {
          error: "Too many registration attempts. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() },
        },
      );
    }

    rateLimitData[key].count++;

    const body = await request.json();
    console.log("Body recibido:", { name: body.name, email: body.email });

    // Validar con Zod (schema del servidor)
    const result = serverRegisterSchema.safeParse(body);
    if (!result.success) {
      console.log("Error de validación:", result.error.issues);
      return NextResponse.json(
        {
          error: "Validación fallida",
          details: result.error.issues.map((issue) => ({
            field: issue.path[0],
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const { email, password, name } = result.data;

    // Validar email format adicional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El formato del email no es válido" },
        { status: 400 },
      );
    }

    console.log("Datos validados:", { email, name });

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Usuario ya existe:", email);
      return NextResponse.json(
        {
          error:
            "Este email ya está registrado. Intenta con otro o inicia sesión.",
        },
        { status: 409 },
      );
    }

    // Validar longitud de nombre
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre debe tener al menos 2 caracteres" },
        { status: 400 },
      );
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      );
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Contraseña hasheada");

    // Crear usuario en base de datos
    const user = await prisma.usuario.create({
      data: {
        email,
        nombre: name.trim(),
        password: hashedPassword,
      },
    });

    console.log("Usuario creado:", user.id);

    // Obtener todos los PrecioItem con tipo "mejora" para inicializar
    const mejorasPrecios = await prisma.precioItem.findMany({
      where: { tipo: "mejora" },
    });

    // Crear mejoras por defecto para el usuario con precio inicial
    if (mejorasPrecios.length > 0) {
      await prisma.mejora.createMany({
        data: mejorasPrecios.map((precioItem) => ({
          usuario_id: user.id,
          precio_item_id: precioItem.id,
          cantidad: 0,
          precio_pagado: precioItem.precio_base,
        })),
      });
      console.log(
        `${mejorasPrecios.length} mejoras inicializadas para usuario ${user.id}`,
      );
    }

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
    console.error("Error en registro:", error);

    // Validar si es un error de Prisma (base de datos)
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    // Si es un error de validación de base de datos
    if (errorMessage.includes("Unique constraint failed")) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 409 },
      );
    }

    // Para otros errores
    return NextResponse.json(
      { error: "Error al registrar usuario. Por favor intenta más tarde." },
      { status: 500 },
    );
  }
}
