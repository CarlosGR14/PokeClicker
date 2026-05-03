/* eslint-disable @next/next/no-img-element */
import styles from "../game.module.css";
import type { CollectedPokemon } from "../types";

interface Props {
  displayedPokemon: (CollectedPokemon | null)[];
  collectedCount: number;
  onSlotClick: (index: number) => void;
  onPokedexOpen: () => void;
  onShopOpen: () => void;
}

export default function Expositor({
  displayedPokemon,
  collectedCount,
  onSlotClick,
  onPokedexOpen,
  onShopOpen,
}: Props) {
  return (
    <div className={styles.expositorSection}>
      <h3 className={styles.expositorTitle}>Expositor</h3>
      <div className={styles.displaySlots}>
        {displayedPokemon.map((pokemon, index) => (
          <button
            key={index}
            className={`${styles.displaySlot} ${pokemon ? styles.displaySlotFilled : styles.displaySlotEmpty}`}
            onClick={() => onSlotClick(index)}
            title={
              pokemon
                ? `${pokemon.name} (${pokemon.rarity})`
                : "Seleccionar pokémon"
            }
          >
            {pokemon ? (
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className={styles.displaySlotImage}
              />
            ) : (
              <span className={styles.displaySlotPlaceholder}>+</span>
            )}
          </button>
        ))}
      </div>
      <button className={styles.pokedexBtn} onClick={onPokedexOpen}>
        📖 Pokédex ({collectedCount})
      </button>
      <button className={styles.openShopMobileBtn} onClick={onShopOpen}>
        🛒 Abrir Tienda
      </button>
    </div>
  );
}
