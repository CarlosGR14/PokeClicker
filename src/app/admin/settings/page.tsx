"use client";

import styles from "../admin.module.css";
import settingsStyles from "../settings.module.css";

export default function SettingsPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>⚙️ Ajustes del Sistema</h1>
          <p className={styles.pageDescription}>
            Información y estado de la aplicación
          </p>
        </div>
      </div>

      {/* System Status */}
      <div className={settingsStyles.settingsSection}>
        <h2 className={settingsStyles.sectionTitle}>🟢 Estado del Sistema</h2>
        <div className={settingsStyles.gridContainer}>
          <div className={settingsStyles.statusCard}>
            <div className={settingsStyles.statusLabel}>Base de Datos</div>
            <div className={settingsStyles.statusValue}>✓ Operativa</div>
          </div>

          <div className={settingsStyles.statusCard}>
            <div className={settingsStyles.statusLabel}>Servidor API</div>
            <div className={settingsStyles.statusValue}>✓ En línea</div>
          </div>

          <div className={settingsStyles.statusCard}>
            <div className={settingsStyles.statusLabel}>PokeAPI</div>
            <div className={settingsStyles.statusValue}>✓ Disponible</div>
          </div>

          <div className={settingsStyles.statusCard}>
            <div className={settingsStyles.statusLabel}>Uso de CPU</div>
            <div className={settingsStyles.cpuValue}>42%</div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className={settingsStyles.systemInfoContainer}>
        <h2 className={settingsStyles.sectionTitle}>
          📋 Información del Sistema
        </h2>

        <div className={settingsStyles.infoGrid}>
          <div>
            <div className={settingsStyles.infoLabel}>Versión de la App</div>
            <div className={settingsStyles.infoValue}>1.0.0</div>
          </div>

          <div>
            <div className={settingsStyles.infoLabel}>Fecha de Deployment</div>
            <div className={settingsStyles.infoValue}>2026-05-10</div>
          </div>

          <div>
            <div className={settingsStyles.infoLabel}>Framework</div>
            <div className={settingsStyles.infoValue}>Next.js 14.2</div>
          </div>

          <div>
            <div className={settingsStyles.infoLabel}>Base de Datos</div>
            <div className={settingsStyles.infoValue}>
              MySQL 8.0 + Prisma ORM
            </div>
          </div>

          <div>
            <div className={settingsStyles.infoLabel}>Autenticación</div>
            <div className={settingsStyles.infoValue}>NextAuth.js</div>
          </div>

          <div>
            <div className={settingsStyles.infoLabel}>Uptime</div>
            <div className={settingsStyles.infoValue}>99.8%</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        style={{
          background: "oklch(95% 0.16 20)",
          padding: "24px",
          borderRadius: "12px",
          marginTop: "32px",
          border: "1px solid oklch(85% 0.16 20)",
        }}
      >
        <h2
          style={{
            fontSize: "1.1rem",
            marginBottom: "16px",
            color: "oklch(52% 0.18 15)",
            fontWeight: 700,
          }}
        >
          ⚠️ Zona de Peligro
        </h2>
        <p
          style={{
            color: "oklch(40% 0.016 20)",
            marginBottom: "16px",
            fontSize: "0.95rem",
          }}
        >
          Estas acciones pueden afectar significativamente el sistema. Úsalas
          con cuidado.
        </p>
        <button className={styles.buttonDanger} style={{ marginRight: "12px" }}>
          🔄 Reiniciar Servidor
        </button>
        <button className={styles.buttonDanger}>🗑️ Limpiar Cache</button>
      </div>
    </>
  );
}
