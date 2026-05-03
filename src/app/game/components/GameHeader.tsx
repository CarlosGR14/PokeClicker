import { useEffect, useState } from "react";
import styles from "../game.module.css";

interface Props {
  pokemonName: string;
  level: number;
  money: number;
  onSettingsClick?: () => void;
}

export default function GameHeader({
  pokemonName,
  level,
  money,
  onSettingsClick,
}: Props) {
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);

  useEffect(() => {
    if (level > prevLevel) {
      setIsLevelingUp(true);
      const timer = setTimeout(() => setIsLevelingUp(false), 800);
      setPrevLevel(level);
      return () => clearTimeout(timer);
    }
    setPrevLevel(level);
  }, [level, prevLevel]);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.playerName}>{pokemonName}</h1>
        <div
          className={`${styles.level} ${isLevelingUp ? styles.animateLevelUp : ""}`}
        >
          Lvl. {level}
        </div>
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
          type="button"
        >
          🚪
        </button>
      </div>
    </header>
  );
}
