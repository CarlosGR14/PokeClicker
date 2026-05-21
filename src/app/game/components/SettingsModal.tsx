/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import styles from "../game.module.css";

interface Props {
  open: boolean;
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
  onClose: () => void;
}

export default function SettingsModal({
  open,
  theme,
  onThemeChange,
  onClose,
}: Props) {
  if (!open) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={styles.pokedexBackdrop} onClick={handleClose}>
      <div className={styles.pokedexModal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.pokedexModalHeader}>
          <h2 className={styles.pokedexModalTitle}>Configuración</h2>
          <button
            className={styles.pokedexModalClose}
            onClick={handleClose}
            aria-label="Cerrar configuración"
            type="button"
          >
            ✕
          </button>
        </header>

        <section className={styles.pokedexModalContent}>
          <fieldset className={styles.settingsSection}>
            <h3 className={styles.settingsTitle}>Tema</h3>
            <p className={styles.settingsDescription}>
              Elige cómo deseas ver la interfaz
            </p>

            <div className={styles.themeOptions}>
              <button
                className={`${styles.themeOption} ${
                  theme === "light" ? styles.themeOptionActive : ""
                }`}
                onClick={() => onThemeChange("light")}
                type="button"
                aria-pressed={theme === "light"}
              >
                <span className={styles.themeIcon}>☀️</span>
                <span className={styles.themeName}>Claro</span>
              </button>

              <button
                className={`${styles.themeOption} ${
                  theme === "dark" ? styles.themeOptionActive : ""
                }`}
                onClick={() => onThemeChange("dark")}
                type="button"
                aria-pressed={theme === "dark"}
              >
                <span className={styles.themeIcon}>🌙</span>
                <span className={styles.themeName}>Oscuro</span>
              </button>

              <button
                className={`${styles.themeOption} ${
                  theme === "system" ? styles.themeOptionActive : ""
                }`}
                onClick={() => onThemeChange("system")}
                type="button"
                aria-pressed={theme === "system"}
              >
                <span className={styles.themeIcon}>🖥️</span>
                <span className={styles.themeName}>Sistema</span>
              </button>
            </div>
          </fieldset>

          <article className={styles.settingsSection}>
            <h3 className={styles.settingsTitle}>Información</h3>
            <p className={styles.settingsInfo}>Pokéclicker v1.0.0 © 2026</p>
          </article>
        </section>
      </div>
    </div>
  );
}
