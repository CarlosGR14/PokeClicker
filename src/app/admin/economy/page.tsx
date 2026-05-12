"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";

interface PriceItem {
  id: number;
  nombre: string;
  tipo: "mejora" | "sobre";
  precio_base: number;
}

export default function EconomyPage() {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/prices", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch prices");

        const data = await response.json();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching prices:", err);
        setError("Error al cargar precios");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  const handleEditPrice = (item: PriceItem) => {
    setEditingId(item.id);
    setEditPrice(item.precio_base ?? 0);
  };

  const handleSavePrice = async (id: number) => {
    try {
      const response = await fetch("/api/admin/prices", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, precio_base: editPrice }),
      });

      if (!response.ok) throw new Error("Failed to update price");

      const updated = await response.json();
      setItems(items.map((item) => (item.id === id ? updated : item)));
      setEditingId(null);
    } catch (error) {
      console.error("Error saving price:", error);
      alert("Error al guardar el precio");
    }
  };

  const mejorasItems = items.filter((i) => i.tipo === "mejora");
  const sobresItems = items.filter((i) => i.tipo === "sobre");

  if (loading) return <p>Cargando precios...</p>;
  if (error) return <p style={{ color: "red" }}>❌ {error}</p>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>💰 Economía del Juego</h1>
          <p className={styles.pageDescription}>
            Ajusta precios de mejoras y sobres
          </p>
        </div>
      </div>

      {/* Mejoras Section */}
      <div style={{ marginBottom: "40px" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            marginBottom: "16px",
            color: "oklch(52% 0.18 15)",
            fontWeight: 700,
          }}
        >
          🛠️ Precios de Mejoras
        </h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mejora</th>
                <th>Precio Base</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mejorasItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editPrice || ""}
                        onChange={(e) =>
                          setEditPrice(e.target.valueAsNumber || 0)
                        }
                        className={styles.input}
                        style={{ maxWidth: "100px" }}
                      />
                    ) : (
                      <code
                        style={{
                          fontWeight: 600,
                          color: "oklch(45% 0.08 250)",
                        }}
                      >
                        {item.precio_base}
                      </code>
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className={styles.buttonPrimary}
                          onClick={() => handleSavePrice(item.id)}
                          style={{
                            padding: "8px 16px",
                            fontSize: "0.85rem",
                          }}
                        >
                          💾 Guardar
                        </button>
                        <button
                          className={styles.buttonSecondary}
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: "8px 16px",
                            fontSize: "0.85rem",
                          }}
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles.buttonSecondary}
                        onClick={() => handleEditPrice(item)}
                        style={{
                          padding: "8px 12px",
                          fontSize: "0.85rem",
                        }}
                      >
                        ✏️ Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sobres Section */}
      <div>
        <h2
          style={{
            fontSize: "1.25rem",
            marginBottom: "16px",
            color: "oklch(52% 0.18 15)",
            fontWeight: 700,
          }}
        >
          🎁 Precios de Sobres
        </h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sobre</th>
                <th>Precio Base</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sobresItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editPrice || ""}
                        onChange={(e) =>
                          setEditPrice(e.target.valueAsNumber || 0)
                        }
                        className={styles.input}
                        style={{ maxWidth: "100px" }}
                      />
                    ) : (
                      <code
                        style={{
                          fontWeight: 600,
                          color: "oklch(45% 0.08 250)",
                        }}
                      >
                        {item.precio_base}
                      </code>
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className={styles.buttonPrimary}
                          onClick={() => handleSavePrice(item.id)}
                          style={{
                            padding: "8px 16px",
                            fontSize: "0.85rem",
                          }}
                        >
                          💾 Guardar
                        </button>
                        <button
                          className={styles.buttonSecondary}
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: "8px 16px",
                            fontSize: "0.85rem",
                          }}
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles.buttonSecondary}
                        onClick={() => handleEditPrice(item)}
                        style={{
                          padding: "8px 12px",
                          fontSize: "0.85rem",
                        }}
                      >
                        ✏️ Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
