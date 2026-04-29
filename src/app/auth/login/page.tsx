"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./login.module.css";

interface FormErrors {
  [key: string]: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "email":
        if (!value.trim()) return "El email es requerido";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Por favor ingresa un email válido";
        }
        return "";
      case "password":
        if (!value) return "La contraseña es requerida";
        return "";
      default:
        return "";
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Validar mientras se escribe si el campo fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Simular envío al servidor
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Login exitoso:", {
        email: formData.email,
      });

      // Redirigir al juego
      window.location.href = "/game";
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
