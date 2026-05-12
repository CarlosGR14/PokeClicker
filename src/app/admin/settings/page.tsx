"use client";

import styles from "../admin.module.css";

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
      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            marginBottom: "16px",
            color: "oklch(52% 0.18 15)",
            fontWeight: 700,
          }}
        >
          🟢 Estado del Sistema
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid oklch(87% 0.01 20)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "oklch(50% 0.008 20)" }}>
              Base de Datos
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "oklch(65% 0.12 145)",
                marginTop: "8px",
              }}
            >
              ✓ Operativa
            </div>
          </div>

          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid oklch(87% 0.01 20)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "oklch(50% 0.008 20)" }}>
              Servidor API
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "oklch(65% 0.12 145)",
                marginTop: "8px",
              }}
            >
              ✓ En línea
            </div>
          </div>

          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid oklch(87% 0.01 20)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "oklch(50% 0.008 20)" }}>
              PokeAPI
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "oklch(65% 0.12 145)",
                marginTop: "8px",
              }}
            >
              ✓ Disponible
            </div>
          </div>

          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid oklch(87% 0.01 20)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "oklch(50% 0.008 20)" }}>
              Uso de CPU
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "oklch(45% 0.08 250)",
                marginTop: "8px",
              }}
            >
              42%
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid oklch(87% 0.01 20)",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            marginBottom: "24px",
            color: "oklch(52% 0.18 15)",
            fontWeight: 700,
          }}
        >
          📋 Información del Sistema
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "oklch(50% 0.008 20)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Versión de la App
            </div>
            <div
              style={{
                fontSize: "1rem",
                color: "oklch(30% 0.008 20)",
                fontWeight: 500,
              }}
            >
              1.0.0
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "oklch(50% 0.008 20)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Fecha de Deployment
            </div>
            <div
              style={{
                fontSize: "1rem",
                color: "oklch(30% 0.008 20)",
                fontWeight: 500,
              }}
            >
              2026-05-10
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "oklch(50% 0.008 20)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Framework
            </div>
            <div
              style={{
                fontSize: "1rem",
                color: "oklch(30% 0.008 20)",
                fontWeight: 500,
              }}
            >
              Next.js 14.2
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "oklch(50% 0.008 20)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Base de Datos
            </div>
            <div
              style={{
                fontSize: "1rem",
                color: "oklch(30% 0.008 20)",
                fontWeight: 500,
              }}
            >
              MySQL 8.0 + Prisma ORM
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "oklch(50% 0.008 20)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Autenticación
            </div>
            <div
              style={{
                fontSize: "1rem",
                color: "oklch(30% 0.008 20)",
                fontWeight: 500,
              }}
            >
              NextAuth.js
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "oklch(50% 0.008 20)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Uptime
            </div>
            <div
              style={{
                fontSize: "1rem",
                color: "oklch(30% 0.008 20)",
                fontWeight: 500,
              }}
            >
              99.8%
            </div>
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
