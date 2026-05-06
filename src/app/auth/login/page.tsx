"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ZodError } from "zod";
import styles from "./login.module.css";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Redirigir según el rol si ya está autenticado
  useEffect(() => {
    if (session?.user?.role) {
      if (session.user.role === "admin") {
        router.push("/admin");
      } else if (session.user.role === "jugador") {
        router.push("/game");
      }
    }
  }, [session, router]);

  const validateField = (fieldName: string): string => {
    try {
      // Validar el campo específico con el esquema completo
      loginSchema.parse(formData);
      return "";
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldError = error.issues.find(
          (issue) => issue.path[0] === fieldName,
        );
        return fieldError?.message || "";
      }
      return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Validar mientras se escribe si el campo fue tocado
    if (touched[name]) {
      const error = validateField(name);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    const error = validateField(name);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar el formulario completo con Zod
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as string;
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Usar signIn de NextAuth
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setErrors({ submit: "Email o contraseña incorrectos." });
        return;
      }

      if (signInResult?.ok) {
        // Redirigir directamente a /game después del login exitoso
        // No esperar al useEffect porque la sesión no se refresca bien en todos los dispositivos
        router.push("/game");
      }
    } catch (error) {
      setErrors({ submit: "Error al iniciar sesión. Intenta de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bienvenido</h1>
        <p className={styles.subtitle}>Continúa tu aventura en Pokéclicker</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="tu@email.com"
              className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ""}`}
              aria-describedby={
                errors.email && touched.email ? "email-error" : undefined
              }
              autoComplete="email"
            />
            {errors.email && touched.email && (
              <span className={styles.error} id="email-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ""}`}
              aria-describedby={
                errors.password && touched.password
                  ? "password-error"
                  : undefined
              }
              autoComplete="current-password"
            />
            {errors.password && touched.password && (
              <span className={styles.error} id="password-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {errors.submit && (
            <div className={styles.errorAlert}>{errors.submit}</div>
          )}

          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className={styles.divider}>O</div>

        <p className={styles.registerLink}>
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className={styles.link}>
            Regístrate aquí
          </Link>
        </p>

        <Link href="/" className={styles.backLink}>
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
