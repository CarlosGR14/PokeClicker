/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
import styles from "../game.module.css";
import { RARITY_LABELS, type CollectedPokemon } from "../types";

interface Props {
  pokemon: CollectedPokemon | null;
  onClose: () => void;
}

export default function CaptureReveal({ pokemon, onClose }: Props) {
  useEffect(() => {
    if (!pokemon) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [pokemon, onClose]);

  if (!pokemon) return null;

  return (
    <div className={styles.captureRevealBackdrop} onClick={onClose}>
      <div
        className={`${styles.captureRevealCard} ${styles[`captureReveal_${pokemon.rarity}`]} ${styles.animateCaptureFlash}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.captureRevealBadge}>
          {RARITY_LABELS[pokemon.rarity]}
        </div>
        <img
          src={pokemon.image || undefined}
          alt={pokemon.name}
          className={styles.captureRevealImage}
        />
        <div className={styles.captureRevealName}>{pokemon.name}</div>
        <button
          className={styles.captureRevealClose}
          onClick={onClose}
          type="button"
        >
          ¡Genial!
        </button>
      </div>
    </div>
  );
}
