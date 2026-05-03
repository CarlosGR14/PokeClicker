import { useEffect, useState } from "react";
import styles from "../game.module.css";

interface ClickEffect {
  x: number;
  y: number;
  id: string;
}

interface Props {
  cps: number;
  clickEffect: ClickEffect | null;
  onPokeballClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function ClickerSection({
  cps,
  clickEffect,
  onPokeballClick,
}: Props) {
  const [isWiggling, setIsWiggling] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsWiggling(true);
    const timer = setTimeout(() => setIsWiggling(false), 500);
    onPokeballClick(e);
    return () => clearTimeout(timer);
  };

  return (
    <div className={styles.clickerSection}>
      <div className={styles.perClickContainer}>
        <span className={styles.perClickLabel}>Por clic:</span>
        <span className={styles.perClickValue}>+1</span>
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
            +1
          </div>
        )}
      </button>

      <div className={styles.multiplierContainer}>
        <span className={styles.multiplierLabel}>Multiplicador:</span>
        <span className={styles.multiplierValue}>{cps.toFixed(2)}x</span>
      </div>
    </div>
  );
}
