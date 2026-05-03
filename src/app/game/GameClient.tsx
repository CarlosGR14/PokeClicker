"use client";

import { useState, useEffect } from "react";
import styles from "./game.module.css";
import { getPokemonById } from "@/services/pokeapi";
import {
  INITIAL_UPGRADES,
  PACKS,
  rollRarity,
  pickPokemonId,
  makeCaptureId,
  type GameState,
  type CollectedPokemon,
} from "./types";
import GameHeader from "./components/GameHeader";
import ClickerSection from "./components/ClickerSection";
import Expositor from "./components/Expositor";
import Shop from "./components/Shop";
import PokedexModal from "./components/PokedexModal";
import DisplaySlotModal from "./components/DisplaySlotModal";
import CaptureReveal from "./components/CaptureReveal";
import SettingsModal from "./components/SettingsModal";

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

function loadGameState(): GameState {
  const saved = localStorage.getItem("pokeclicker_game");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...getDefaultGameState(),
        ...parsed,
        collectedPokemon: Array.isArray(parsed.collectedPokemon)
          ? parsed.collectedPokemon
          : [],
      };
    } catch {
      // corrupted save
    }
  }
  return getDefaultGameState();
}

export default function GameClient() {
  // Safe to read localStorage here — SSR is disabled for this component
  const [gameState, setGameState] = useState<GameState>(loadGameState);

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  // Apply theme to document
  const applyTheme = (t: "light" | "dark" | "system") => {
    const html = document.documentElement;

    if (t === "system") {
      html.style.colorScheme = "light dark";
      html.removeAttribute("data-theme");
    } else if (t === "dark") {
      html.style.colorScheme = "dark";
      html.setAttribute("data-theme", "dark");
    } else {
      html.style.colorScheme = "light";
      html.setAttribute("data-theme", "light");
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("pokeclicker_theme", newTheme);
  };

  // Load theme preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("pokeclicker_theme") as
      | "light"
      | "dark"
      | "system"
      | null;
    if (saved) {
      applyTheme(saved);
      // eslint-disable-next-line
      setTheme(saved);
    } else {
      // Default to system preference
      applyTheme("system");
    }
  }, []);

  // Load initial Pokémon image if not in saved state
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
      localStorage.setItem("pokeclicker_game", JSON.stringify(gameState));
    }, 500);
    return () => clearTimeout(timer);
  }, [gameState]);

  // Passive income - optimized with requestAnimationFrame
  useEffect(() => {
    if (gameState.cps === 0) return;
    let lastTime = Date.now();
    let animationId: number;

    const updatePassiveIncome = () => {
      const now = Date.now();
      const elapsed = now - lastTime;

      // Only update every ~100ms for consistency
      if (elapsed >= 100) {
        setGameState((prev) => ({
          ...prev,
          money: prev.money + prev.cps / 10,
        }));
        lastTime = now;
      }

      animationId = requestAnimationFrame(updatePassiveIncome);
    };

    animationId = requestAnimationFrame(updatePassiveIncome);
    return () => cancelAnimationFrame(animationId);
  }, [gameState.cps]);

  const handlePokemonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickEffect({ x, y, id: Math.random().toString() });
    setTimeout(() => setClickEffect(null), 700);
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

  const handleDisplaySlotSelect = (slot: number, pokemon: CollectedPokemon) => {
    setDisplayedPokemon((prev) => {
      const next = [...prev];
      next[slot] = pokemon;
      return next;
    });
    setSelectedDisplaySlot(null);
  };

  return (
    <div className={styles.gameContainer}>
      <GameHeader
        pokemonName={gameState.pokemonName}
        level={gameState.level}
        money={gameState.money}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <div className={styles.mainLayout}>
        <main className={styles.gameCenter}>
          <ClickerSection
            cps={gameState.cps}
            clickEffect={clickEffect}
            onPokeballClick={handlePokemonClick}
          />
          <Expositor
            displayedPokemon={displayedPokemon}
            collectedCount={gameState.collectedPokemon?.length ?? 0}
            onSlotClick={setSelectedDisplaySlot}
            onPokedexOpen={() => setPokedexOpen(true)}
            onShopOpen={() => setShopDrawerOpen(true)}
          />
        </main>

        <aside className={styles.shopSidebar}>
          <Shop
            upgrades={gameState.upgrades}
            money={gameState.money}
            isOpening={isOpening}
            shopTab={shopTab}
            onTabChange={setShopTab}
            onBuyUpgrade={buyUpgrade}
            onOpenPack={openPack}
          />
        </aside>

        <PokedexModal
          open={pokedexOpen}
          pokemon={gameState.collectedPokemon ?? []}
          onClose={() => setPokedexOpen(false)}
        />

        <DisplaySlotModal
          slotIndex={selectedDisplaySlot}
          pokemon={gameState.collectedPokemon ?? []}
          onSelect={handleDisplaySlotSelect}
          onClose={() => setSelectedDisplaySlot(null)}
        />
      </div>

      {/* Mobile Shop Drawer */}
      {shopDrawerOpen && (
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
            </div>
            <Shop
              upgrades={gameState.upgrades}
              money={gameState.money}
              isOpening={isOpening}
              shopTab={shopTab}
              onTabChange={setShopTab}
              onBuyUpgrade={buyUpgrade}
              onOpenPack={openPack}
            />
          </div>
        </>
      )}

      <CaptureReveal
        pokemon={lastCaptured}
        onClose={() => setLastCaptured(null)}
      />

      <SettingsModal
        open={settingsOpen}
        theme={theme}
        onThemeChange={handleThemeChange}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
