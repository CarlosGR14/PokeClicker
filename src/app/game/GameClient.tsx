"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
    cps: 0,
    upgrades: INITIAL_UPGRADES,
    collectedPokemon: [],
  };
}

export default function GameClient() {
  // Safe to read localStorage here — SSR is disabled for this component
  const { data: session } = useSession();
  const [gameState, setGameState] = useState<GameState>(getDefaultGameState);
  const [isLoading, setIsLoading] = useState(true);

  const [clickEffect, setClickEffect] = useState<{
    x: number;
    y: number;
    id: string;
  } | null>(null);
  const [pokedexOpen, setPokedexOpen] = useState(false);

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
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const saved = localStorage.getItem("pokeclicker_theme") as
      | "light"
      | "dark"
      | "system"
      | null;
    return saved || "system";
  });

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

  // Load game state from BD on mount
  useEffect(() => {
    const loadGameFromDB = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/game/state");
        if (!response.ok) throw new Error("Failed to load game state");

        const data: GameState = await response.json();

        // Merge BD upgrades with INITIAL_UPGRADES to ensure all upgrades are present
        const mergedUpgrades = INITIAL_UPGRADES.map((initialUpgrade) => {
          const dbUpgrade = data.upgrades?.find(
            (u) => u.id === initialUpgrade.id,
          );
          return dbUpgrade || initialUpgrade;
        });

        // Fill Pokemon details from PokeAPI
        const filledPokemon = await Promise.all(
          data.collectedPokemon.map(async (pokemon) => {
            if (pokemon.name && pokemon.image) return pokemon;
            try {
              const details = await getPokemonById(parseInt(pokemon.id));
              return {
                ...pokemon,
                name: details.name,
                image: details.image,
              };
            } catch (error) {
              console.error(`Error fetching Pokemon ${pokemon.id}:`, error);
              return pokemon;
            }
          }),
        );

        setGameState({
          ...data,
          upgrades: mergedUpgrades,
          collectedPokemon: filledPokemon,
        });
      } catch (error) {
        console.error("Error loading game state:", error);
        // Fallback to default state
        setGameState(getDefaultGameState());
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.email) {
      loadGameFromDB();
    }
  }, [session?.user?.email]);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Save game state to BD
  useEffect(() => {
    // Don't save while still loading
    if (isLoading) return;

    const timer = setTimeout(() => {
      const saveGameToDB = async () => {
        try {
          const response = await fetch("/api/game/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gameState),
          });
          if (!response.ok) throw new Error("Failed to save game state");
        } catch (error) {
          console.error("Error saving game state:", error);
        }
      };

      saveGameToDB();
    }, 500);

    return () => clearTimeout(timer);
  }, [gameState, isLoading]);

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

    // Calcular total click damage (1 + bonus from upgrades)
    const totalClickBonus = gameState.upgrades
      .filter((u) => u.count > 0 && (u.clickBonus || 0) > 0)
      .reduce((sum, u) => sum + (u.clickBonus || 0) * u.count, 0);
    const totalClickDamage = 1 + totalClickBonus;

    setGameState((prev) => ({
      ...prev,
      money: prev.money + totalClickDamage,
      clicks: prev.clicks + totalClickDamage,
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
    // Update gameState to reflect the new position
    setGameState((prev) => {
      const updated = prev.collectedPokemon.map((p) => {
        // Clear indiceSlot from any pokemon currently in this slot
        if (p.indiceSlot === slot) {
          return { ...p, indiceSlot: null };
        }
        // If this is the pokemon being assigned, set its indiceSlot
        if (p.id === pokemon.id) {
          return { ...p, indiceSlot: slot };
        }
        return p;
      });
      return {
        ...prev,
        collectedPokemon: updated,
      };
    });

    setSelectedDisplaySlot(null);
  };

  // Derive displayedPokemon from gameState instead of maintaining as state
  const displayedPokemon: (CollectedPokemon | null)[] = [
    null,
    null,
    null,
    null,
  ];
  gameState.collectedPokemon.forEach((pokemon) => {
    if (
      pokemon.indiceSlot !== null &&
      pokemon.indiceSlot !== undefined &&
      pokemon.indiceSlot >= 0 &&
      pokemon.indiceSlot < 4
    ) {
      displayedPokemon[pokemon.indiceSlot] = pokemon;
    }
  });

  return (
    <div className={styles.gameContainer}>
      <GameHeader
        userName={session?.user?.name || "Jugador"}
        money={gameState.money}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <div className={styles.mainLayout}>
        <main className={styles.gameCenter}>
          <ClickerSection
            cps={gameState.cps}
            clickBonus={gameState.upgrades
              .filter((u) => u.count > 0 && (u.clickBonus || 0) > 0)
              .reduce((sum, u) => sum + (u.clickBonus || 0) * u.count, 0)}
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
