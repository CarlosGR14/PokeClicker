"use client";

import { signOut } from "next-auth/react";
import styles from "../game/game.module.css";

export default function AdminPage() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.playerName}>Dashboard Admin</h1>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.headerBtn}
            aria-label="Cerrar sesión"
            onClick={handleLogout}
            type="button"
          >
            🚪
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Bienvenido al Panel de Administración</h2>
          <p>Aquí irán las funcionalidades de administrador</p>

          <div style={{ marginTop: "2rem", textAlign: "left" }}>
            <h3>Funcionalidades planeadas:</h3>
            <ul>
              <li>Gestionar usuarios</li>
              <li>Ver estadísticas del juego</li>
              <li>Configurar parámetros del juego</li>
              <li>Ver reportes</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
