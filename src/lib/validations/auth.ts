import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido").trim(),
    email: z
      .string()
      .min(1, "El email es requerido")
      .email("Por favor ingresa un email válido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Schema para validar en el servidor (sin confirmPassword)
export const serverRegisterSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").trim(),
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Por favor ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Por favor ingresa un email válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
