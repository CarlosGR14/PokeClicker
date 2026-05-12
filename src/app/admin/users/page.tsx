"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";

interface User {
  id: number;
  nombre: string;
  email: string;
  monedas: number;
  clicks: string | number;
  role: string;
  tema: string;
  fecha_creacion: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<User>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/users", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditValues({ ...user });
    setSaveError(null);
  };

  const handleSave = async (id: number) => {
    try {
      setSaveError(null);

      const response = await fetch("/api/admin/users", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          monedas: editValues.monedas,
          role: editValues.role,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user");
      }

      const updated = await response.json();
      setUsers(
        users.map((user) => (user.id === id ? { ...user, ...updated } : user)),
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error saving user:", error);
      setSaveError(
        error instanceof Error ? error.message : "Error al guardar usuario",
      );
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p style={{ color: "red" }}>❌ {error}</p>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>👥 Gestión de Usuarios</h1>
          <p className={styles.pageDescription}>
            Edita saldos, roles y gestiona cuentas de jugadores
          </p>
        </div>
      </div>

      {saveError && (
        <div style={{ color: "red", marginBottom: "16px", padding: "8px" }}>
          ❌ {saveError}
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Monedas</th>
              <th>Clicks</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {editingId === user.id ? (
                    <input
                      type="text"
                      value={editValues.nombre || ""}
                      onChange={(e) =>
                        setEditValues({ ...editValues, nombre: e.target.value })
                      }
                      className={styles.input}
                      style={{ maxWidth: "120px" }}
                      disabled
                    />
                  ) : (
                    user.nombre
                  )}
                </td>
                <td>{user.email}</td>
                <td>
                  {editingId === user.id ? (
                    <input
                      type="number"
                      value={editValues.monedas || 0}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          monedas: parseInt(e.target.value),
                        })
                      }
                      className={styles.input}
                      style={{ maxWidth: "100px" }}
                    />
                  ) : (
                    user.monedas.toLocaleString()
                  )}
                </td>
                <td>
                  {typeof user.clicks === "string"
                    ? user.clicks
                    : user.clicks.toString()}
                </td>
                <td>
                  {editingId === user.id ? (
                    <select
                      value={editValues.role || "jugador"}
                      onChange={(e) =>
                        setEditValues({ ...editValues, role: e.target.value })
                      }
                      className={styles.input}
                      style={{ maxWidth: "80px" }}
                    >
                      <option value="jugador">jugador</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editingId === user.id ? (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className={styles.buttonPrimary}
                        onClick={() => handleSave(user.id)}
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      >
                        💾 Guardar
                      </button>
                      <button
                        className={styles.buttonSecondary}
                        onClick={() => setEditingId(null)}
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className={styles.buttonSecondary}
                        onClick={() => handleEdit(user)}
                        style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className={styles.buttonDanger}
                        style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                      >
                        🗑️ Banear
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
