"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import styles from "./admin.module.css";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user?.email) {
      router.push("/auth/login");
      return;
    }

    // Verificar si es admin haciendo fetch al endpoint
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/admin/stats", {
          credentials: "include",
        });
        if (response.status === 403 || response.status === 401) {
          router.push("/game");
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/game");
      }
    };

    checkAdmin();
  }, [session, status, router]);

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { label: "📊 Resumen", href: "/admin" },
    { label: "👥 Usuarios", href: "/admin/users" },
    { label: "💰 Economía", href: "/admin/economy" },
    { label: "⚙️ Ajustes", href: "/admin/settings" },
  ];

  if (status === "loading" || !isAdmin) {
    return <p style={{ padding: "20px" }}>Verificando permisos...</p>;
  }

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logoText}>PokeAdmin</h2>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                isActive(item.href) ? styles.navItemActive : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className={styles.logoutBtn}
            onClick={async () => {
              await signOut({ callbackUrl: "/auth/login" });
            }}
            type="button"
            aria-label="Cerrar sesión"
          >
            🚪 Salir
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>{children}</div>
      </main>
    </div>
  );
}
