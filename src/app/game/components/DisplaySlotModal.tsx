/* eslint-disable @next/next/no-img-element */
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
  if (slotIndex === null) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={styles.pokedexBackdrop} onClick={handleClose}>
      <div className={styles.pokedexModal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.pokedexModalHeader}>
          <h2 className={styles.pokedexModalTitle}>
            Selecciona un Pokémon — Slot {slotIndex + 1}
          </h2>
          <button
            className={styles.pokedexModalClose}
            onClick={handleClose}
            aria-label="Cerrar modal"
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
                    <div className={styles.pokedexNumber}>#{p.pokeapi_id}</div>
                    <div className={styles.pokedexCantidad}>
                      ×{p.cantidad ?? 1}
                    </div>
                  </button>
                ))}
            </div>
          ) : (
            <div className={styles.pokedexEmpty}>
              <span className={styles.pokedexEmptyEmoji}>🔍</span>
              <p>No has capturado ningún Pokémon aún</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
