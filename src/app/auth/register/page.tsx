"use client";

import { useState } from "react";
import Link from "next/link";
import { ZodError } from "zod";
import styles from "./register.module.css";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (fieldName: string): string => {
    try {
      // Validar el campo específico con el esquema completo
      registerSchema.parse(formData);
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
    const result = registerSchema.safeParse(formData);
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
    setErrors({}); // Limpiar errores previos

    try {
      // Enviar datos al servidor
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error en registro:", data);

        // Determinar el tipo de error y mostrar mensaje específico
        let errorMessage = "Error al registrarse. Intenta de nuevo.";

        if (response.status === 409) {
          errorMessage =
            "Este email ya está registrado. Intenta con otro o inicia sesión.";
        } else if (response.status === 400) {
          errorMessage = data.error || "Los datos ingresados no son válidos.";
        } else if (response.status === 500) {
          errorMessage =
            "Error interno del servidor. Por favor intenta más tarde.";
        } else {
          errorMessage = data.error || errorMessage;
        }

        setErrors({
          submit: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      console.log("Registro exitoso:", data);

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (error) {
      console.error("Error en fetch:", error);

      // Manejar diferentes tipos de errores de red
      let errorMessage = "Error al conectar con el servidor.";

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage =
          "No se pudo conectar al servidor. Verifica tu conexión a internet.";
      }

      setErrors({ submit: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Crear Cuenta</h1>
        <p className={styles.subtitle}>Únete a la aventura de Pokéclicker</p>

        {success && (
          <div className={styles.successMessage}>
            ¡Registro exitoso! Redirigiendo al login...
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Juan Pérez"
              className={`${styles.input} ${errors.name && touched.name ? styles.inputError : ""}`}
              aria-describedby={
                errors.name && touched.name ? "name-error" : undefined
              }
            />
            {errors.name && touched.name && (
              <span className={styles.error} id="name-error" role="alert">
                {errors.name}
              </span>
            )}
          </div>

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
            />
            {errors.password && touched.password && (
              <span className={styles.error} id="password-error" role="alert">
                {errors.password}
              </span>
            )}
            {!errors.password && formData.password && (
              <span className={styles.hint}>✓ Contraseña válida</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              className={`${styles.input} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ""}`}
              aria-describedby={
                errors.confirmPassword && touched.confirmPassword
                  ? "confirmPassword-error"
                  : undefined
              }
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <span
                className={styles.error}
                id="confirmPassword-error"
                role="alert"
              >
                {errors.confirmPassword}
              </span>
            )}
            {!errors.confirmPassword &&
              formData.confirmPassword &&
              formData.password === formData.confirmPassword && (
                <span className={styles.hint}>✓ Las contraseñas coinciden</span>
              )}
          </div>

          {errors.submit && <div className={styles.error}>{errors.submit}</div>}

          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className={styles.loginLink}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className={styles.link}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
