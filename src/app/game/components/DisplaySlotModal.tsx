/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
import styles from "../game.module.css";
import type { CollectedPokemon } from "../types";

interface Props {
  slotIndex: number | null;
  pokemon: CollectedPokemon[];
  onSelect: (slotIndex: number, pokemon: CollectedPokemon) => void;
  onClose: () => void;
}

export default function DisplaySlotModal({
  slotIndex,
  pokemon,
  onSelect,
  onClose,
}: Props) {
  useEffect(() => {
    if (slotIndex === null) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [slotIndex, onClose]);

  if (slotIndex === null) return null;

  return (
    <div className={styles.pokedexBackdrop} onClick={onClose}>
      <div className={styles.pokedexModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.pokedexModalHeader}>
          <h2 className={styles.pokedexModalTitle}>
            Selecciona un Pokémon — Slot {slotIndex + 1}
          </h2>
          <button
            className={styles.pokedexModalClose}
            onClick={onClose}
            aria-label="Cerrar modal"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className={styles.pokedexModalContent}>
          {pokemon.length > 0 ? (
            <div className={styles.pokedexModalGrid}>
              {pokemon.map((p) => (
                <button
                  key={p.id}
                  className={`${styles.pokedexCard} ${styles[`rarity_${p.rarity}`]}`}
                  onClick={() => onSelect(slotIndex, p)}
                  type="button"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className={styles.pokedexImage}
                    loading="lazy"
                  />
                  <div className={styles.pokedexName}>{p.name}</div>
                  <div className={styles.pokedexRarity}>{p.rarity}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.pokedexEmpty}>
              <span className={styles.pokedexEmptyEmoji}>🔍</span>
              <p>No has capturado ningún Pokémon aún</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
