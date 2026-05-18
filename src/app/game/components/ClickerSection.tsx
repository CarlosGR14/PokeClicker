import { useEffect, useState } from "react";
import styles from "../game.module.css";

interface ClickEffect {
  x: number;
  y: number;
  id: string;
}

interface Props {
  cps: number | undefined;
  clickBonus: number;
  clickEffect: ClickEffect | null;
  onPokeballClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function ClickerSection({
  cps,
  clickBonus,
  clickEffect,
  onPokeballClick,
}: Props) {
  const totalClickDamage = 1 + clickBonus;
  const [isWiggling, setIsWiggling] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 500);
      onPokeballClick(e);
    } catch (error) {
      // Silenciar errores de pointer capture
      console.debug("Click handler error:", error);
    }
  };

  return (
    <section className={styles.clickerSection}>
      <div className={styles.perClickContainer}>
        <span className={styles.perClickLabel}>Por clic:</span>
        <span className={styles.perClickValue}>+{totalClickDamage}</span>
      </div>

      <button
        className={`${styles.pokemonCircle} ${isWiggling ? styles.animatePokeBallWiggle : ""}`}
        onClick={handleClick}
        aria-label="Haz clic en la Pokéball para ganar dinero"
        type="button"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pokeball.png"
          alt="Pokéball"
          className={styles.pokemonImage}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
        {clickEffect && (
          <div
            className={styles.clickEffect}
            style={{ left: `${clickEffect.x}px`, top: `${clickEffect.y}px` }}
          >
            +{totalClickDamage}
          </div>
        )}
      </button>

      <div className={styles.multiplierContainer}>
        <span className={styles.multiplierLabel}>Dinero por segundo:</span>
        <span className={styles.multiplierValue}>{(cps ?? 0).toFixed(2)}</span>
      </div>
    </section>
  );
}
