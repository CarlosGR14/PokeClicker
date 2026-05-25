"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import styles from "./game.module.css";
import { getPokemonById } from "@/services/pokeapi";
import {
  INITIAL_UPGRADES,
  PACKS,
  rollRarity,
  pickPokemonId,
  makeCaptureId,
  preWarmGen1Cache,
  warmRarityCache,
  initializePokemonPool,
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

// ============ CONSTANTS ============
const MIN_TIME_BETWEEN_SAVES = 2000; // 2 seconds
const SAVE_DELAY_NORMAL = 5000; // Guardar cada 5 segundos (cambios normales)
const SAVE_DELAY_IMPORTANT = 1000; // Guardar en 1 segundo (cambios importantes)
const SAVE_DELAY_CRITICAL = 200; // Guardar en 200ms (capturas, pérdida de dinero)

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
  // Solo lectura directa de localStorage (SSR deshabilitado)
  const { data: session } = useSession();
  const [gameState, setGameState] = useState<GameState>(getDefaultGameState);
  const [isSavePending, setIsSavePending] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<{
    multiplicador_costo: number;
  }>({ multiplicador_costo: 1.15 });
  const [priceBaseMap, setPriceBaseMap] = useState<Record<string, number>>({});
  const [packsData, setPacksData] = useState<typeof PACKS>(PACKS);
  const lastSaveRef = useRef<number>(0);
  const needsSaveRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef<boolean>(false); // Previene concurrent saves

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
    if (typeof window === "undefined") return "system";
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

  // Cargar estado del juego cuando monta el componente
  useEffect(() => {
    const loadGameFromDB = async () => {
      try {
        // Cargar lista de Pokémon y datos del juego en paralelo
        await Promise.all([
          initializePokemonPool(), // Cargar clasificaciones de Pokémon
          fetch("/api/game/state", { credentials: "include" }),
          fetch("/api/game/prices", { credentials: "include" }),
        ]).then(async (results) => {
          // Ignoramos el resultado del pool y usamos las otras respuestas
          const [, gameResponse, pricesResponse] = results as unknown as [
            unknown,
            Response,
            Response,
          ];

          if (!gameResponse.ok) {
            const errorData = await gameResponse.json().catch(() => ({}));
            throw new Error(
              `Failed to load game state: ${gameResponse.status} ${JSON.stringify(errorData)}`,
            );
          }
          if (!pricesResponse.ok) {
            const errorData = await pricesResponse.json().catch(() => ({}));
            throw new Error(
              `Failed to load prices: ${pricesResponse.status} ${JSON.stringify(errorData)}`,
            );
          }

          const data: GameState = await gameResponse.json();
          const pricesData = await pricesResponse.json();

          // Almacenar precios base para cálculos posteriores
          const priceMap: Record<string, number> = {};
          pricesData.prices.forEach(
            (price: { nombre: string; precio_base: number }) => {
              priceMap[price.nombre] = price.precio_base;
            },
          );
          setPriceBaseMap(priceMap);
          setPricingConfig(pricesData.config);

          // Actualizar precios de los paquetes desde BD
          const updatedPacks = PACKS.map((pack) => ({
            ...pack,
            cost: priceMap[pack.name] || pack.cost,
          }));
          setPacksData(updatedPacks);

          // Combinar mejoras de BD con las iniciales para tenerlas todas
          const mergedUpgrades = INITIAL_UPGRADES.map((initialUpgrade) => {
            const dbUpgrade = data.upgrades?.find(
              (u) => u.id === initialUpgrade.id,
            );

            // Si existe en BD, usarla; si no, crear con precio de BD
            if (dbUpgrade) {
              return dbUpgrade;
            }

            // Si la mejora es nueva, usar el precio de BD si existe
            const priceFromDB = priceMap[initialUpgrade.name];
            return {
              ...initialUpgrade,
              cost: priceFromDB || initialUpgrade.cost,
            };
          });

          // Completar nombre e imagen de Pokémon desde PokeAPI si faltan
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

          // Background cache warming (non-blocking)
          // 1. Pre-warm Gen I Pokémon (most common)
          preWarmGen1Cache();

          // Precalentar Pokémon capturados del usuario
          const userPokemonIds = filledPokemon.map((p) => p.pokeapi_id || 0);
          if (userPokemonIds.length > 0) {
            warmRarityCache(userPokemonIds);
          }
        });
      } catch (error) {
        console.error("Error loading game state:", error);
        // Volver al estado por defecto
        setGameState(getDefaultGameState());
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

  // Actualizar precios cada 5 segundos (cambios del admin)
  useEffect(() => {
    const refreshPrices = async () => {
      try {
        const pricesResponse = await fetch("/api/game/prices", {
          credentials: "include",
        });
        if (pricesResponse.ok) {
          const pricesData = await pricesResponse.json();
          const newPriceMap: Record<string, number> = {};
          pricesData.prices.forEach(
            (price: { nombre: string; precio_base: number }) => {
              newPriceMap[price.nombre] = price.precio_base;
            },
          );
          setPriceBaseMap(newPriceMap);
          setPricingConfig(pricesData.config);

          // Actualizar precios de los paquetes desde BD
          const updatedPacks = PACKS.map((pack) => ({
            ...pack,
            cost: newPriceMap[pack.name] || pack.cost,
          }));
          setPacksData(updatedPacks);
        }
      } catch (error) {
        console.error("Error refreshing prices:", error);
      }
    };

    const interval = setInterval(refreshPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  // Guardar estado del juego (con cooldown y validaciones)
  // Usar isSavingRef para prevenir guardados concurrentes
  const scheduleGameSave = useCallback(
    (urgency: "normal" | "important" | "critical" = "important") => {
      // Cancelar timeout anterior si existe
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // No guardar si ya hay un guardado en progreso
      if (isSavingRef.current) {
        return;
      }

      const now = Date.now();
      const timeSinceLastSave = now - lastSaveRef.current;

      // Saltar si no es urgente y no ha pasado suficiente tiempo
      if (urgency === "normal" && timeSinceLastSave < MIN_TIME_BETWEEN_SAVES) {
        return;
      }

      // El delay depende de qué tan urgente es guardar
      let delay: number;
      if (urgency === "critical") {
        delay = SAVE_DELAY_CRITICAL;
      } else if (urgency === "important") {
        delay = SAVE_DELAY_IMPORTANT;
      } else {
        delay = SAVE_DELAY_NORMAL;
      }

      setIsSavePending(true);
      saveTimeoutRef.current = setTimeout(async () => {
        isSavingRef.current = true;
        try {
          // Validar que los datos sean válidos antes de guardar
          if (gameState.money < 0) {
            console.warn("Invalid money value detected, rejecting save");
            return;
          }
          if (gameState.clicks < 0) {
            console.warn("Invalid clicks value detected, rejecting save");
            return;
          }
          if (gameState.cps < 0) {
            console.warn("Invalid CPS value detected, rejecting save");
            return;
          }

          const response = await fetch("/api/game/save", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gameState),
          });

          if (response.status === 401) {
            // Sesión expirada, redirigir a login
            console.error("Session expired, redirecting to login");
            window.location.href = "/auth/login";
            return;
          }

          if (!response.ok) {
            throw new Error(`Save failed with status ${response.status}`);
          }

          lastSaveRef.current = Date.now();
          needsSaveRef.current = false;
          setIsSavePending(false);
          console.log("Game saved successfully");
        } catch (error) {
          console.error("Error saving game state:", error);
          setIsSavePending(false);
        } finally {
          isSavingRef.current = false;
        }
      }, delay);
    },
    [gameState],
  );

  // Guardar inmediatamente (botón manual de guardado)
  const forceGameSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSavePending(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Validar que los datos sean válidos antes de guardar
        if (gameState.money < 0) {
          console.warn("Invalid money value detected, rejecting save");
          return;
        }
        if (gameState.clicks < 0) {
          console.warn("Invalid clicks value detected, rejecting save");
          return;
        }
        if (gameState.cps < 0) {
          console.warn("Invalid CPS value detected, rejecting save");
          return;
        }

        const response = await fetch("/api/game/save", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gameState),
        });

        if (response.status === 401) {
          console.error("Session expired, redirecting to login");
          window.location.href = "/auth/login";
          return;
        }

        if (!response.ok) {
          throw new Error(`Save failed with status ${response.status}`);
        }

        lastSaveRef.current = Date.now();
        needsSaveRef.current = false;
        setIsSavePending(false);
        console.log("Game saved successfully (manual save)");
      } catch (error) {
        console.error("Error saving game state:", error);
        setIsSavePending(false);
      }
    }, 100); // Retraso mínimo para guardados manuales
  }, [gameState]);

  // Ganancia pasiva optimizada con requestAnimationFrame
  useEffect(() => {
    if (gameState.cps === 0) return;
    let lastTime = Date.now();
    let accumulatedMoney = 0;
    let animationId: number;

    const updatePassiveIncome = () => {
      const now = Date.now();
      const deltaSeconds = (now - lastTime) / 1000;
      accumulatedMoney += gameState.cps * deltaSeconds;

      if (accumulatedMoney >= 1) {
        const moneyToAdd = Math.floor(accumulatedMoney);
        setGameState((prev) => ({
          ...prev,
          money: prev.money + moneyToAdd,
        }));
        accumulatedMoney -= moneyToAdd;
        lastTime = now;
      }

      animationId = requestAnimationFrame(updatePassiveIncome);
    };

    animationId = requestAnimationFrame(updatePassiveIncome);
    return () => cancelAnimationFrame(animationId);
  }, [gameState.cps]);

  const handlePokemonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setClickEffect({ x, y, id: Math.random().toString() });
      setTimeout(() => setClickEffect(null), 700);

      // Calcular daño total por clic (base 1 + bonus de mejoras)
      const totalClickBonus = gameState.upgrades
        .filter((u) => u.count > 0 && (u.clickBonus || 0) > 0)
        .reduce((sum, u) => sum + (u.clickBonus || 0) * u.count, 0);
      const totalClickDamage = 1 + totalClickBonus;

      setGameState((prev) => ({
        ...prev,
        money: prev.money + totalClickDamage,
        clicks: prev.clicks + totalClickDamage,
      }));
      // Auto-save después de click (normal - 5s)
      scheduleGameSave("normal");
    } catch (error) {
      console.error("Click handler error:", error);
    }
  };

  const buyUpgrade = (upgradeId: string) => {
    setGameState((prev) => {
      const upgrade = prev.upgrades.find((u) => u.id === upgradeId);
      if (!upgrade || prev.money < upgrade.cost) return prev;

      // Calcular el próximo precio dinámicamente
      const priceBase = priceBaseMap[upgrade.name] || upgrade.cost;
      const nextCount = upgrade.count + 1;
      const nextCost = Math.floor(
        priceBase * Math.pow(pricingConfig.multiplicador_costo, nextCount),
      );

      return {
        ...prev,
        money: prev.money - upgrade.cost,
        cps: prev.cps + upgrade.cpsBonus,
        upgrades: prev.upgrades.map((u) =>
          u.id === upgradeId ? { ...u, count: nextCount, cost: nextCost } : u,
        ),
      };
    });

    // Recargar precios después de compra para reflejar cambios de admin
    (async () => {
      try {
        const pricesResponse = await fetch("/api/game/prices", {
          credentials: "include",
        });
        if (pricesResponse.ok) {
          const pricesData = await pricesResponse.json();
          const newPriceMap: Record<string, number> = {};
          pricesData.prices.forEach(
            (price: { nombre: string; precio_base: number }) => {
              newPriceMap[price.nombre] = price.precio_base;
            },
          );
          setPriceBaseMap(newPriceMap);
          setPricingConfig(pricesData.config);

          // Actualizar precios de los paquetes desde BD
          const updatedPacks = PACKS.map((pack) => ({
            ...pack,
            cost: newPriceMap[pack.name] || pack.cost,
          }));
          setPacksData(updatedPacks);
        }
      } catch (error) {
        console.error("Error reloading prices:", error);
      }
    })();

    // Auto-save después de compra (importante - 1s)
    scheduleGameSave("important");
  };

  const openPack = async (packId: string) => {
    const pack = packsData.find((p) => p.id === packId);
    if (!pack || gameState.money < pack.cost) return;
    setIsOpening(packId);
    setGameState((prev) => ({ ...prev, money: prev.money - pack.cost }));
    const rarity = rollRarity(packId);

    // Función para obtener un nuevo Pokémon (permite duplicados)
    const getNewPokemon = async (): Promise<{
      pokemon: Awaited<ReturnType<typeof getPokemonById>>;
      pokemonId: number;
    } | null> => {
      let attempts = 0;
      const maxAttempts = 5; // Solo intentar 5 veces para evitar loop

      while (attempts < maxAttempts) {
        const pokemonId = pickPokemonId(rarity);

        try {
          const pokemon = await getPokemonById(pokemonId);
          return { pokemon, pokemonId };
        } catch (error) {
          console.error(`Error fetching Pokémon ${pokemonId}:`, error);
          attempts++;
          continue;
        }
      }

      return null;
    };

    try {
      const result = await getNewPokemon();

      if (!result) {
        console.warn("Could not find a new Pokémon after 50 attempts");
        setGameState((prev) => ({ ...prev, money: prev.money + pack.cost }));
        setIsOpening(null);
        return;
      }

      const { pokemon, pokemonId } = result;

      // Verificar si el Pokémon ya existe
      const existingPokemon = gameState.collectedPokemon?.find(
        (p) => p.pokeapi_id === pokemonId,
      );

      if (existingPokemon) {
        // Si existe, REEMPLAZAR con nueva versión (con timestamp para tracking)
        // Esto evita duplicados cuando se captura el mismo Pokemon varias veces
        const newCaptured: CollectedPokemon = {
          id: makeCaptureId(pokemonId), // Nuevo ID con timestamp
          name: pokemon.name,
          image: pokemon.image,
          rarity,
          cantidad: (existingPokemon.cantidad ?? 1) + 1, // Incrementa desde el existente
          indiceSlot: existingPokemon.indiceSlot, // Mantiene slot si está en expositor
          pokeapi_id: pokemonId,
        };

        setGameState((prev) => ({
          ...prev,
          collectedPokemon: (prev.collectedPokemon ?? [])
            // Filtrar TODOS los con este pokeapi_id para evitar duplicados
            .filter((p) => p.pokeapi_id !== pokemonId)
            // Agregar la nueva versión con timestamp
            .concat(newCaptured),
        }));
        setLastCaptured(newCaptured);
      } else {
        // Si no existe, crear uno nuevo
        const captured: CollectedPokemon = {
          id: makeCaptureId(pokemonId),
          name: pokemon.name,
          image: pokemon.image,
          rarity,
          cantidad: 1,
          pokeapi_id: pokemonId,
        };
        setGameState((prev) => ({
          ...prev,
          collectedPokemon: [...(prev.collectedPokemon ?? []), captured],
        }));
        setLastCaptured(captured);
      }
      // Auto-save después de captura (CRÍTICO - 200ms)
      scheduleGameSave("critical");
    } catch (error) {
      console.error("Error fetching Pokémon:", error);
      setGameState((prev) => ({ ...prev, money: prev.money + pack.cost }));
    } finally {
      setIsOpening(null);
    }
  };

  const handleDisplaySlotSelect = (slot: number, pokemon: CollectedPokemon) => {
    // Actualizar el estado para reflejar la nueva posición
    setGameState((prev) => {
      const updated = prev.collectedPokemon.map((p) => {
        // Limpiar indiceSlot de cualquier Pokémon que esté en este slot
        if (p.indiceSlot === slot) {
          return { ...p, indiceSlot: null };
        }
        // Si es el Pokémon asignado, establecer su indiceSlot
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

    // Auto-save después de cambiar slot (importante - 1s)
    scheduleGameSave("important");
  };

  // Derivar displayedPokemon del gameState en lugar de mantenerlo como state
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
        onForceSave={forceGameSave}
        isSavePending={isSavePending}
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
            packs={packsData}
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
              packs={packsData}
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
