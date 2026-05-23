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
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(2px)",
            animation: "fadeIn 200ms ease-out",
          }}
          onClick={handleCancelDelete}
        >
          <div
            style={{
              backgroundColor: "white",
              border: "2px solid #dbd2d1",
              borderRadius: "16px",
              padding: "32px",
              minWidth: "420px",
              maxWidth: "540px",
              boxShadow:
                "0 20px 60px rgba(185, 40, 70, 0.12), 0 8px 24px rgba(0, 0, 0, 0.1)",
              animation: "slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#fef2f2",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                marginBottom: "20px",
              }}
            >
              ⚠️
            </div>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "12px",
                color: "#b92846",
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.3px",
              }}
            >
              Eliminar cuenta
            </h2>
            <p
              style={{
                marginBottom: "16px",
                lineHeight: "1.6",
                color: "#322c2c",
                fontSize: "0.95rem",
              }}
            >
              ¿Estás seguro de que deseas{" "}
              <strong>eliminar permanentemente</strong> la cuenta de{" "}
              <strong>"{userToDelete.nombre}"</strong>?
            </p>
            <p
              style={{
                marginBottom: "28px",
                color: "#4c4646",
                fontSize: "0.85rem",
                lineHeight: "1.5",
                backgroundColor: "#fef6f6",
                padding: "12px 14px",
                borderRadius: "8px",
                borderLeft: "3px solid #ac2f3b",
              }}
            >
              <strong>Atención:</strong> Esta acción no se puede deshacer. Se
              eliminarán todos los datos incluyendo pokémon capturados, mejoras
              y registro de transacciones.
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
                style={{
                  padding: "12px 24px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  borderRadius: "10px",
                  whiteSpace: "nowrap",
                  transition: "all 180ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dcd5d4";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0e9e9";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Cancelar
              </button>
              <button
                className={styles.buttonDanger}
                onClick={handleConfirmDelete}
                disabled={deleteLoading === userToDelete.id}
                style={{
                  padding: "12px 24px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  borderRadius: "10px",
                  whiteSpace: "nowrap",
                  transition: "all 180ms cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: deleteLoading === userToDelete.id ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (deleteLoading !== userToDelete.id) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {deleteLoading === userToDelete.id
                  ? "Eliminando..."
                  : "🗑️ Eliminar"}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(12px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
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
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className={styles.buttonPrimary}
                        onClick={() => handleSave(user.id)}
                        style={{
                          padding: "10px 18px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          borderRadius: "10px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        💾 Guardar
                      </button>
                      <button
                        className={styles.buttonSecondary}
                        onClick={() => setEditingId(null)}
                        style={{
                          padding: "10px 18px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          borderRadius: "10px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className={styles.buttonSecondary}
                        onClick={() => handleEdit(user)}
                        style={{
                          padding: "10px 16px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          borderRadius: "10px",
                          whiteSpace: "nowrap",
                          transition:
                            "all 180ms cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#dcd5d4";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0e9e9";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className={styles.buttonDanger}
                        onClick={() => handleDeleteClick(user)}
                        disabled={deleteLoading === user.id}
                        style={{
                          padding: "10px 16px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          borderRadius: "10px",
                          whiteSpace: "nowrap",
                          transition:
                            "all 180ms cubic-bezier(0.4, 0, 0.2, 1)",
                          opacity: deleteLoading === user.id ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (deleteLoading !== user.id) {
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
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
