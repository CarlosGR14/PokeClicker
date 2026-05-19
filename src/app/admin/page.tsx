"use client";

import { useEffect, useState } from "react";
import styles from "./admin.module.css";

interface DashboardStats {
  totalUsers: number;
  totalCoins: number;
  totalPokemon: number;
  recentUsers: Array<{
    id: number;
    email: string;
    nombre: string;
    fecha_creacion: string;
  }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/stats", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Error al cargar estadísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📊 Resumen General</h1>
          <p className={styles.pageDescription}>
            Estado actual del juego y actividad de usuarios
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ padding: "20px", color: "oklch(50% 0.008 20)" }}>
          ⏳ Cargando datos...
        </p>
      ) : error ? (
        <p
          style={{
            color: "oklch(50% 0.16 20)",
            padding: "20px",
            fontWeight: 600,
          }}
        >
          ❌ {error}
        </p>
      ) : (
        <>
          {/* KPI Grid */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>👥 Usuarios Totales</div>
              <div className={styles.kpiValue}>
                {stats?.totalUsers.toLocaleString()}
              </div>
              <div className={styles.kpiSubtext}>Jugadores registrados</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>💰 Monedas en Circulación</div>
              <div className={styles.kpiValue}>
                {(stats?.totalCoins ?? 0) > 1000000
                  ? ((stats?.totalCoins ?? 0) / 1000000).toFixed(1) + "M"
                  : (stats?.totalCoins ?? 0).toLocaleString()}
              </div>
              <div className={styles.kpiSubtext}>Total acumulado</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>🎲 Pokémon Capturados</div>
              <div className={styles.kpiValue}>
                {stats?.totalPokemon.toLocaleString()}
              </div>
              <div className={styles.kpiSubtext}>Colección total</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>📈 Tasa de Actividad</div>
              <div className={styles.kpiValue}>87%</div>
              <div className={styles.kpiSubtext}>Usuarios activos hoy</div>
            </div>
          </div>

          {/* Recent Users Table */}
          <div>
            <h2
              style={{
                fontSize: "1.25rem",
                marginBottom: "16px",
                color: "oklch(52% 0.18 15)",
                fontWeight: 700,
              }}
            >
              📝 Registros Recientes
            </h2>
            <div className={styles.tableContainer}>
              <table className={styles.table} style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "25%" }}>Usuario</th>
                    <th style={{ width: "50%" }}>Email</th>
                    <th style={{ width: "25%" }}>Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.nombre}</td>
                      <td>{user.email}</td>
                      <td>
                        {new Date(user.fecha_creacion).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
