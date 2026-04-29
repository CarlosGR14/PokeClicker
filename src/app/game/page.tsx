"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useSyncExternalStore } from "react";
import styles from "./game.module.css";
import { getPokemonById } from "@/services/pokeapi";

interface GameState {
  money: number;
  clicks: number;
  pokemonName: string;
  pokemonImage: string;
  level: number;
  cps: number;
  upgrades: Upgrade[];
  collectedPokemon: CollectedPokemon[];
}

interface Upgrade {
  id: string;
  name: string;
  cost: number;
  count: number;
  cpsBonus: number;
  description: string;
}

interface CollectedPokemon {
  id: string;
  name: string;
  image: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: "pokeball",
    name: "Poké Ball",
    cost: 10,
    count: 0,
    cpsBonus: 0.1,
    description: "+0.1 por segundo",
  },
  {
    id: "greatball",
    name: "Great Ball",
    cost: 100,
    count: 0,
    cpsBonus: 1,
    description: "+1 por segundo",
  },
  {
    id: "ultraball",
    name: "Ultra Ball",
    cost: 1000,
    count: 0,
    cpsBonus: 10,
    description: "+10 por segundo",
  },
  {
    id: "masterball",
    name: "Master Ball",
    cost: 10000,
    count: 0,
    cpsBonus: 100,
    description: "+100 por segundo",
  },
];

interface Pack {
  id: string;
  name: string;
  cost: number;
  emoji: string;
  probabilities: {
    common?: number;
    rare?: number;
    epic?: number;
    legendary?: number;
  };
}

const PACKS: Pack[] = [
  {
    id: "basic",
    name: "Sobre Básico",
    cost: 100,
    emoji: "📦",
    probabilities: { common: 80, rare: 18, legendary: 2 },
  },
  {
    id: "epic",
    name: "Sobre Épico",
    cost: 1000,
    emoji: "✨",
    probabilities: { common: 30, epic: 50, legendary: 20 },
  },
];

const LEGENDARY_IDS = [144, 145, 146, 150, 151, 249, 250, 382, 383, 384, 487];
const EPIC_IDS = [6, 9, 65, 94, 130, 143, 149, 248, 373, 376, 445, 448, 131];
const COMMON_IDS = Array.from({ length: 151 }, (_, i) => i + 1).filter(
  (id) => !LEGENDARY_IDS.includes(id) && !EPIC_IDS.includes(id),
);

const UPGRADE_ICONS: Record<string, string> = {
  pokeball: "🔴",
  greatball: "🔵",
  ultraball: "⚫",
  masterball: "💜",
};

const RARITY_LABELS: Record<string, string> = {
  legendary: "⭐ LEGENDARIO",
  epic: "💜 ÉPICO",
  rare: "🟢 RARO",
  common: "⚪ COMÚN",
};

function rollRarity(packId: string): CollectedPokemon["rarity"] {
  const roll = Math.random() * 100;
  if (packId === "basic") {
    if (roll < 2) return "legendary";
    if (roll < 20) return "rare";
    return "common";
  }
  if (roll < 20) return "legendary";
  if (roll < 70) return "epic";
  return "common";
}

function pickPokemonId(rarity: CollectedPokemon["rarity"]): number {
  if (rarity === "legendary")
    return LEGENDARY_IDS[Math.floor(Math.random() * LEGENDARY_IDS.length)];
  if (rarity === "epic")
    return EPIC_IDS[Math.floor(Math.random() * EPIC_IDS.length)];
  if (rarity === "rare") return Math.floor(Math.random() * 100) + 152;
  return COMMON_IDS[Math.floor(Math.random() * COMMON_IDS.length)];
}

function makeCaptureId(pokemonId: number): string {
  return `${pokemonId}_${Date.now()}`;
}

export default function GamePage() {
  function getDefaultGameState(): GameState {
    return {
      money: 0,
      clicks: 0,
      pokemonName: "Pikachu",
      pokemonImage: "",
      level: 1,
      cps: 0,
      upgrades: INITIAL_UPGRADES,
      collectedPokemon: [],
    };
  }

  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window === "undefined") return getDefaultGameState();
    const saved = localStorage.getItem("pokeclicker_game");
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        const defaultState = getDefaultGameState();
        return {
          ...defaultState,
          ...parsedState,
          collectedPokemon: Array.isArray(parsedState.collectedPokemon)
            ? parsedState.collectedPokemon
            : [],
        };
      } catch {
        return getDefaultGameState();
      }
    }
    return getDefaultGameState();
  });
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [clickEffect, setClickEffect] = useState<{
    x: number;
    y: number;
    id: string;
  } | null>(null);
  const [pokedexOpen, setPokedexOpen] = useState(false);
  const [displayedPokemon, setDisplayedPokemon] = useState<
    (CollectedPokemon | null)[]
  >([null, null, null, null]);
  const [selectedDisplaySlot, setSelectedDisplaySlot] = useState<number | null>(
    null,
  );
  const [shopTab, setShopTab] = useState<"mejoras" | "sobres">("mejoras");
  const [shopDrawerOpen, setShopDrawerOpen] = useState(false);
  const [lastCaptured, setLastCaptured] = useState<CollectedPokemon | null>(
    null,
  );
  const [isOpening, setIsOpening] = useState<string | null>(null);

  // Load initial Pokémon if no saved state
  useEffect(() => {
    if (!gameState.pokemonImage) {
      void getPokemonById("pikachu")
        .then((pokemon) => {
          setGameState((prev) => ({
            ...prev,
            pokemonName: pokemon.name,
            pokemonImage: pokemon.image,
          }));
        })
        .catch((error) => {
          console.error("Error loading initial Pokémon:", error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save game state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("pokeclicker_game", JSON.stringify(gameState));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [gameState]);

  // Passive income from upgrades
  useEffect(() => {
    if (gameState.cps === 0) return;

    const interval = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        money: prev.money + prev.cps / 10,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.cps]);

  const handlePokemonClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Math.random().toString();

    setClickEffect({ x, y, id });
    setTimeout(() => setClickEffect(null), 500);

    setGameState((prev) => ({
      ...prev,
      money: prev.money + 1,
      clicks: prev.clicks + 1,
      level: Math.floor((prev.clicks + 1) / 100) + 1,
    }));
  };

  const buyUpgrade = (upgradeId: string) => {
    setGameState((prev) => {
      const upgrade = prev.upgrades.find((u) => u.id === upgradeId);
      if (!upgrade || prev.money < upgrade.cost) return prev;
      return {
        ...prev,
        money: prev.money - upgrade.cost,
        cps: prev.cps + upgrade.cpsBonus,
        upgrades: prev.upgrades.map((u) =>
          u.id === upgradeId
            ? { ...u, count: u.count + 1, cost: Math.floor(u.cost * 1.15) }
            : u,
        ),
      };
    });
  };

  const openPack = async (packId: string) => {
    const pack = PACKS.find((p) => p.id === packId);
    if (!pack || gameState.money < pack.cost) return;
    setIsOpening(packId);
    setGameState((prev) => ({ ...prev, money: prev.money - pack.cost }));

    const rarity = rollRarity(packId);
    const pokemonId = pickPokemonId(rarity);

    try {
      const pokemon = await getPokemonById(pokemonId);
      const captured: CollectedPokemon = {
        id: makeCaptureId(pokemonId),
        name: pokemon.name,
        image: pokemon.image,
        rarity,
      };
      setGameState((prev) => ({
        ...prev,
        collectedPokemon: [...(prev.collectedPokemon ?? []), captured],
      }));
      setLastCaptured(captured);
    } catch (error) {
      console.error("Error fetching Pokémon:", error);
      setGameState((prev) => ({ ...prev, money: prev.money + pack.cost }));
    } finally {
      setIsOpening(null);
    }
  };

  const renderShopTabs = () => (
    <div className={styles.shopTabs}>
      <button
        className={`${styles.shopTab} ${shopTab === "mejoras" ? styles.shopTabActive : ""}`}
        onClick={() => setShopTab("mejoras")}
      >
        ⬆ Mejoras
      </button>
      <button
        className={`${styles.shopTab} ${shopTab === "sobres" ? styles.shopTabActive : ""}`}
        onClick={() => setShopTab("sobres")}
      >
        📦 Sobres
      </button>
    </div>
  );

  const renderShopBody = () => (
    <div className={styles.shopContent}>
      {shopTab === "mejoras" ? (
        <div className={styles.upgradesList}>
          {gameState.upgrades.map((upgrade) => {
            const canAfford = gameState.money >= upgrade.cost;
            return (
              <div
                key={upgrade.id}
                className={`${styles.upgradeCard} ${!canAfford ? styles.upgradeCardDisabled : ""}`}
              >
                <div className={styles.upgradeIconBubble}>
                  {UPGRADE_ICONS[upgrade.id] ?? "🔵"}
                </div>
                <div className={styles.upgradeInfo}>
                  <span className={styles.upgradeName}>{upgrade.name}</span>
                  <span className={styles.upgradeDesc}>
                    {upgrade.description}
                  </span>
                </div>
                <div className={styles.upgradeRight}>
                  {upgrade.count > 0 && (
                    <span className={styles.upgradeCount}>
                      ×{upgrade.count}
                    </span>
                  )}
                  <button
                    className={styles.upgradeBuyBtn}
                    onClick={() => buyUpgrade(upgrade.id)}
                    disabled={!canAfford}
                  >
                    <span className={styles.upgradeBuyIcon}>💰</span>
                    {upgrade.cost.toLocaleString()}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.packsList}>
          {PACKS.map((pack) => {
            const canAfford = gameState.money >= pack.cost;
            const opening = isOpening === pack.id;
            return (
              <div
                key={pack.id}
                className={`${styles.packCard} ${styles[`packCard_${pack.id}`]}`}
              >
                <div className={styles.packIconWrap}>
                  <span
                    className={`${styles.packIcon} ${opening ? styles.packIconShaking : ""}`}
                  >
                    {pack.emoji}
                  </span>
                </div>
                <div className={styles.packName}>{pack.name}</div>
                <div className={styles.packRarities}>
                  {pack.probabilities.common !== undefined && (
                    <span
                      className={`${styles.rarityPill} ${styles.rarityCommonPill}`}
                    >
                      ⚪ {pack.probabilities.common}% Común
                    </span>
                  )}
                  {pack.probabilities.rare !== undefined && (
                    <span
                      className={`${styles.rarityPill} ${styles.rarityRarePill}`}
                    >
                      🟢 {pack.probabilities.rare}% Raro
                    </span>
                  )}
                  {pack.probabilities.epic !== undefined && (
                    <span
                      className={`${styles.rarityPill} ${styles.rarityEpicPill}`}
                    >
                      💜 {pack.probabilities.epic}% Épico
                    </span>
                  )}
                  {pack.probabilities.legendary !== undefined && (
                    <span
                      className={`${styles.rarityPill} ${styles.rarityLegendaryPill}`}
                    >
                      ⭐ {pack.probabilities.legendary}% Legendario
                    </span>
                  )}
                </div>
                <button
                  className={`${styles.packBuyBtn} ${!canAfford ? styles.packBuyBtnDisabled : ""}`}
                  onClick={() => openPack(pack.id)}
                  disabled={!canAfford || isOpening !== null}
                >
                  {opening ? (
                    <span className={styles.packOpening}>Abriendo…</span>
                  ) : (
                    <>💰 {pack.cost.toLocaleString()} — Abrir</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.gameContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.playerName}>{gameState.pokemonName}</h1>
          <div className={styles.level}>Lvl. {gameState.level}</div>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.currencyBox}>
            <span className={styles.currencyLabel}>Dinero</span>
            <div className={styles.money} suppressHydrationWarning>
              {isMounted ? (
                <>
                  <span className={styles.moneyInteger}>
                    {Math.floor(gameState.money)}
                  </span>
                  <span className={styles.moneyDecimal}>
                    .
                    {Math.floor((gameState.money % 1) * 100)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.moneyInteger}>0</span>
                  <span className={styles.moneyDecimal}>.00</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.headerBtn} title="Configuración">
            ⚙️
          </button>
          <button className={styles.headerBtn} title="Cerrar sesión">
            🚪
          </button>
        </div>
      </header>

      {/* Main Layout */}
      {isMounted && (
        <div className={styles.mainLayout}>
          {/* Center - Game */}
          <main className={styles.gameCenter}>
            <div className={styles.clickerSection}>
              {/* Por clic - Above Pokéball */}
              <div className={styles.perClickContainer}>
                <span className={styles.perClickLabel}>Por clic:</span>
                <span className={styles.perClickValue}>+1</span>
              </div>

              {/* Pokéball - Main interactive element */}
              <div
                className={styles.pokemonCircle}
                onClick={handlePokemonClick}
              >
                <img
                  src="/pokeball.png"
                  alt="Pokéball"
                  className={styles.pokemonImage}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              {clickEffect && (
                <div
                  className={styles.clickEffect}
                  style={{
                    left: `${clickEffect.x}px`,
                    top: `${clickEffect.y}px`,
                  }}
                >
                  +1
                </div>
              )}

              {/* Multiplicador - Below Pokéball */}
              <div className={styles.multiplierContainer}>
                <span className={styles.multiplierLabel}>Multiplicador:</span>
                <span className={styles.multiplierValue}>
                  {gameState.cps.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Expositor - 4 Display Slots */}
            <div className={styles.expositorSection}>
              <h3 className={styles.expositorTitle}>Expositor</h3>
              <div className={styles.displaySlots}>
                {displayedPokemon.map((pokemon, index) => (
                  <button
                    key={index}
                    className={`${styles.displaySlot} ${
                      pokemon
                        ? styles.displaySlotFilled
                        : styles.displaySlotEmpty
                    }`}
                    onClick={() => setSelectedDisplaySlot(index)}
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
              <button
                className={styles.pokedexBtn}
                onClick={() => setPokedexOpen(true)}
              >
                📖 Pokédex ({gameState.collectedPokemon?.length ?? 0})
              </button>

              {/* Mobile: Open Shop Button */}
              <button
                className={styles.openShopMobileBtn}
                onClick={() => setShopDrawerOpen(true)}
              >
                🛒 Abrir Tienda
              </button>
            </div>
          </main>

          {/* Desktop Shop Sidebar */}
          <aside className={styles.shopSidebar}>
            <div className={styles.shopHeader}>
              <h2 className={styles.shopTitle}>Tienda</h2>
              {renderShopTabs()}
            </div>
            {renderShopBody()}
          </aside>

          {/* Pokédex Modal */}
          {pokedexOpen && (
            <div
              className={styles.pokedexBackdrop}
              onClick={() => setPokedexOpen(false)}
            >
              <div
                className={styles.pokedexModal}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.pokedexModalHeader}>
                  <h2 className={styles.pokedexModalTitle}>Pokédex</h2>
                  <button
                    className={styles.pokedexModalClose}
                    onClick={() => setPokedexOpen(false)}
                    title="Cerrar"
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.pokedexModalContent}>
                  {(gameState.collectedPokemon?.length ?? 0) > 0 ? (
                    <div className={styles.pokedexModalGrid}>
                      {gameState.collectedPokemon.map((pokemon) => (
                        <div
                          key={pokemon.id}
                          className={`${styles.pokedexCard} ${styles[`rarity_${pokemon.rarity}`]}`}
                        >
                          <img
                            src={pokemon.image}
                            alt={pokemon.name}
                            className={styles.pokedexImage}
                          />
                          <div className={styles.pokedexName}>
                            {pokemon.name}
                          </div>
                          <div className={styles.pokedexRarity}>
                            {pokemon.rarity}
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
          )}

          {/* Display Slot Selection Modal */}
          {selectedDisplaySlot !== null && (
            <div
              className={styles.pokedexBackdrop}
              onClick={() => setSelectedDisplaySlot(null)}
            >
              <div
                className={styles.pokedexModal}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.pokedexModalHeader}>
                  <h2 className={styles.pokedexModalTitle}>
                    Selecciona un Pokémon - Slot {selectedDisplaySlot + 1}
                  </h2>
                  <button
                    className={styles.pokedexModalClose}
                    onClick={() => setSelectedDisplaySlot(null)}
                    title="Cerrar"
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.pokedexModalContent}>
                  {(gameState.collectedPokemon?.length ?? 0) > 0 ? (
                    <div className={styles.pokedexModalGrid}>
                      {gameState.collectedPokemon.map((pokemon) => (
                        <button
                          key={pokemon.id}
                          className={`${styles.pokedexCard} ${styles[`rarity_${pokemon.rarity}`]}`}
                          onClick={() => {
                            const newDisplayed = [...displayedPokemon];
                            newDisplayed[selectedDisplaySlot] = pokemon;
                            setDisplayedPokemon(newDisplayed);
                            setSelectedDisplaySlot(null);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src={pokemon.image}
                            alt={pokemon.name}
                            className={styles.pokedexImage}
                          />
                          <div className={styles.pokedexName}>
                            {pokemon.name}
                          </div>
                          <div className={styles.pokedexRarity}>
                            {pokemon.rarity}
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
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Shop Drawer */}
      {isMounted && shopDrawerOpen && (
        <>
          <div
            className={styles.drawerBackdrop}
            onClick={() => setShopDrawerOpen(false)}
          />
          <div className={styles.shopDrawer}>
            <div className={styles.drawerTop}>
              <div className={styles.drawerHandle} />
              <div className={styles.drawerHeader}>
                <h2 className={styles.shopTitle}>Tienda</h2>
                <button
                  className={styles.drawerClose}
                  onClick={() => setShopDrawerOpen(false)}
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>
              {renderShopTabs()}
            </div>
            {renderShopBody()}
          </div>
        </>
      )}

      {/* Capture Reveal Modal */}
      {isMounted && lastCaptured && (
        <div
          className={styles.captureRevealBackdrop}
          onClick={() => setLastCaptured(null)}
        >
          <div
            className={`${styles.captureRevealCard} ${styles[`captureReveal_${lastCaptured.rarity}`]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.captureRevealBadge}>
              {RARITY_LABELS[lastCaptured.rarity]}
            </div>
            <img
              src={lastCaptured.image}
              alt={lastCaptured.name}
              className={styles.captureRevealImage}
            />
            <div className={styles.captureRevealName}>{lastCaptured.name}</div>
            <button
              className={styles.captureRevealClose}
              onClick={() => setLastCaptured(null)}
            >
              ¡Genial!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
