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
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleteLoading(userToDelete.id);
      setSaveError(null);

      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userToDelete.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers(users.filter((user) => user.id !== userToDelete.id));
      setDeleteModalOpen(false);
      setUserToDelete(null);
      setSaveError(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setSaveError(
        error instanceof Error ? error.message : "Error al eliminar usuario",
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
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

      {deleteModalOpen && userToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCancelDelete}
        >
          <div
            style={{
              backgroundColor: "var(--color-background)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "24px",
              minWidth: "400px",
              maxWidth: "500px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{ marginTop: 0, marginBottom: "16px", color: "#dc2626" }}
            >
              ⚠️ Confirmar eliminación
            </h2>
            <p style={{ marginBottom: "16px", lineHeight: "1.5" }}>
              ¿Estás seguro de que deseas{" "}
              <strong>eliminar permanentemente</strong> la cuenta de{" "}
              <strong>"{userToDelete.nombre}"</strong> ({userToDelete.email})?
            </p>
            <p
              style={{
                marginBottom: "24px",
                color: "#666",
                fontSize: "0.9rem",
              }}
            >
              Esta acción no se puede deshacer. Se eliminarán todos los datos
              del usuario, incluyendo pokémon capturados y mejoras.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                className={styles.buttonSecondary}
                onClick={handleCancelDelete}
                style={{ padding: "10px 20px" }}
              >
                ✕ Cancelar
              </button>
              <button
                className={styles.buttonDanger}
                onClick={handleConfirmDelete}
                disabled={deleteLoading === userToDelete.id}
                style={{ padding: "10px 20px" }}
              >
                {deleteLoading === userToDelete.id
                  ? "Eliminando..."
                  : "🗑️ Eliminar cuenta"}
              </button>
            </div>
          </div>
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
                        onClick={() => handleDeleteClick(user)}
                        disabled={deleteLoading === user.id}
                        style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                      >
                        {deleteLoading === user.id
                          ? "Eliminando..."
                          : "🗑️ Eliminar"}
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
