import { signOut } from "next-auth/react";
import styles from "../game.module.css";

interface Props {
  userName: string;
  money: number | undefined;
  onSettingsClick?: () => void;
}

export default function GameHeader({
  userName,
  money = 0,
  onSettingsClick,
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
