import { signOut } from "next-auth/react";
import styles from "../game.module.css";

interface Props {
  userName: string;
  money: number | undefined;
  onSettingsClick?: () => void;
  onForceSave?: () => void;
  isSavePending?: boolean;
}

export default function GameHeader({
  userName,
  money = 0,
  onSettingsClick,
  onForceSave,
  isSavePending,
}: Props) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.playerName}>{userName}</h1>
      </div>

      <div className={styles.headerCenter}>
        <div className={styles.currencyBox}>
          <span className={styles.currencyLabel}>Dinero</span>
          <div className={styles.money}>
            <span className={styles.moneyInteger}>{Math.floor(money)}</span>
            <span className={styles.moneyDecimal}>
              .
              {Math.floor((money % 1) * 100)
                .toString()
                .padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.headerRight}>
        <button
          className={styles.headerBtn}
          aria-label="Configuración"
          onClick={onSettingsClick}
          type="button"
        >
          ⚙️
        </button>
        <div
          aria-live="polite"
          aria-atomic="true"
          role="status"
          style={{ position: "absolute", left: "-9999px" }}
        >
          {isSavePending ? "Guardando partida..." : ""}
        </div>
        <button
          className={styles.headerBtn}
          aria-label={isSavePending ? "Guardando juego..." : "Guardar juego"}
          onClick={onForceSave}
          type="button"
          title={isSavePending ? "Guardando..." : "Guardar juego ahora"}
          disabled={isSavePending}
          aria-busy={isSavePending}
        >
          {isSavePending ? "💾..." : "💾"}
        </button>
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
  );
}
