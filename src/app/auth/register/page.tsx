"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./register.module.css";

interface FormErrors {
  [key: string]: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        return !value.trim() ? "El nombre es requerido" : "";
      case "email":
        if (!value.trim()) return "El email es requerido";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Por favor ingresa un email válido";
        }
        return "";
      case "password":
        if (!value) return "La contraseña es requerida";
        if (value.length < 6) return "Mínimo 6 caracteres";
        return "";
      case "confirmPassword":
        if (value !== formData.password) return "Las contraseñas no coinciden";
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

      console.log("Registro exitoso:", {
        name: formData.name,
        email: formData.email,
      });

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch {
      setErrors({ submit: "Error al registrarse. Intenta de nuevo." });
    } finally {
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
