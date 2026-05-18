/* eslint-disable @next/next/no-img-element */
import styles from "../game.module.css";
import { RARITY_LABELS, type CollectedPokemon } from "../types";

interface Props {
  pokemon: CollectedPokemon | null;
  onClose: () => void;
}

export default function CaptureReveal({ pokemon, onClose }: Props) {
  if (!pokemon) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={styles.captureRevealBackdrop} onClick={handleClose}>
      <article
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
          onClick={handleClose}
          type="button"
        >
          ¡Genial!
        </button>
      </article>
    </div>
  );
}
