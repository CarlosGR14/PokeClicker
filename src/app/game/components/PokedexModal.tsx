/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import styles from "../game.module.css";
import type { CollectedPokemon } from "../types";

interface Props {
  open: boolean;
  pokemon: CollectedPokemon[];
  onClose: () => void;
}

export default function PokedexModal({ open, pokemon, onClose }: Props) {
  if (!open) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={styles.pokedexBackdrop} onClick={handleClose}>
      <div className={styles.pokedexModal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.pokedexModalHeader}>
          <h2 className={styles.pokedexModalTitle}>Pokédex</h2>
          <button
            className={styles.pokedexModalClose}
            onClick={handleClose}
            aria-label="Cerrar Pokédex"
            type="button"
          >
            ✕
          </button>
        </header>
        <section className={styles.pokedexModalContent}>
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
            <article className={styles.pokedexEmpty}>
              <span className={styles.pokedexEmptyEmoji}>🔍</span>
              <p>No has capturado ningún Pokémon aún</p>
            </article>
          )}
        </section>
      </div>
    </div>
  );
}
