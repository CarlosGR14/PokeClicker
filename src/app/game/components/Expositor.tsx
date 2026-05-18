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
  const rarityColors: Record<string, string> = {
    common: styles.rarityCommon,
    epic: styles.rarityEpic,
    legendary: styles.rarityLegendary,
  };

  return (
    <section className={styles.expositorSection}>
      <header className={styles.expositorHeader}>
        <h2 className={styles.expositorTitle}>✨ Expositor</h2>
        <span className={styles.expositorSubtitle}>Exhibición de Pokémon</span>
      </header>
      <article className={styles.expositorFrame}>
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
                <>
                  <img
                    src={pokemon.image || undefined}
                    alt={pokemon.name}
                    className={styles.displaySlotImage}
                  />
                  <div
                    className={`${styles.rarityBadge} ${rarityColors[pokemon.rarity || "common"] || styles.rarityCommon}`}
                  >
                    {(pokemon.rarity || "common").charAt(0).toUpperCase()}
                  </div>
                  {pokemon.cantidad && pokemon.cantidad > 1 && (
                    <div className={styles.displaySlotCantidad}>
                      ×{pokemon.cantidad}
                    </div>
                  )}
                </>
              ) : (
                <span className={styles.displaySlotPlaceholder}>+</span>
              )}
            </button>
          ))}
        </div>
      </article>
      <nav className={styles.expositorActions}>
        <button className={styles.pokedexBtn} onClick={onPokedexOpen}>
          📖 Pokédex ({collectedCount})
        </button>
        <button className={styles.openShopMobileBtn} onClick={onShopOpen}>
          🛒 Abrir Tienda
        </button>
      </nav>
    </section>
  );
}
