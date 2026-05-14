/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
import styles from "../game.module.css";
import type { CollectedPokemon } from "../types";

interface Props {
  open: boolean;
  pokemon: CollectedPokemon[];
  onClose: () => void;
}

export default function PokedexModal({ open, pokemon, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.pokedexBackdrop} onClick={onClose}>
      <div className={styles.pokedexModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.pokedexModalHeader}>
          <h2 className={styles.pokedexModalTitle}>Pokédex</h2>
          <button
            className={styles.pokedexModalClose}
            onClick={onClose}
            aria-label="Cerrar Pokédex"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className={styles.pokedexModalContent}>
          {pokemon.length > 0 ? (
            <div className={styles.pokedexModalGrid}>
              {pokemon
                .sort((a, b) => (a.pokeapi_id || 0) - (b.pokeapi_id || 0))
                .map((p) => (
                  <div
                    key={p.id}
                    className={`${styles.pokedexCard} ${styles[`rarity_${p.rarity}`]}`}
                  >
                    <img
                      src={p.image || undefined}
                      alt={p.name}
                      className={styles.pokedexImage}
                      loading="lazy"
                    />
                    <div className={styles.pokedexName}>{p.name}</div>
                    <div className={styles.pokedexRarity}>{p.rarity}</div>
                    <div className={styles.pokedexNumber}>#{p.pokeapi_id}</div>
                    <div className={styles.pokedexCantidad}>
                      ×{p.cantidad ?? 1}
                    </div>
                  </div>
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
