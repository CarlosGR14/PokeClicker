"use client";

import { useEffect, useState } from "react";
import styles from "../game.module.css";
import { PACKS, UPGRADE_ICONS, type Upgrade, type Pack } from "../types";

// Mapeo de IDs de mejoras a nombres de items en PokeAPI
const UPGRADE_TO_ITEM_MAP: Record<string, string> = {
  pokeball: "poke-ball",
  greatball: "great-ball",
  ultraball: "ultra-ball",
  masterball: "master-ball",
  luckyPunch: "lucky-punch",
  focusBand: "focus-band",
  lifeorb: "life-orb",
};

interface Props {
  upgrades: Upgrade[];
  money: number | undefined;
  isOpening: string | null;
  shopTab: "mejoras" | "sobres";
  onTabChange: (tab: "mejoras" | "sobres") => void;
  onBuyUpgrade: (id: string) => void;
  onOpenPack: (id: string) => void;
  packs?: Pack[];
}

export default function Shop({
  upgrades,
  money = 0,
  isOpening,
  shopTab,
  onTabChange,
  onBuyUpgrade,
  onOpenPack,
  packs = PACKS,
}: Props) {
  const [itemImages, setItemImages] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const loadItemImages = async () => {
      const images = new Map<string, string>();
      const upgradesToLoad = upgrades.filter(
        (u) => UPGRADE_TO_ITEM_MAP[u.id] && !itemImages.has(u.id),
      );

      // Load all images in parallel instead of sequentially
      const promises = upgradesToLoad.map(async (upgrade) => {
        const pokeapiItemName = UPGRADE_TO_ITEM_MAP[upgrade.id];
        if (!pokeapiItemName) return null;

        try {
          const response = await fetch(
            `/api/pokeapi/item?id=${encodeURIComponent(pokeapiItemName)}`,
          );
          if (response.ok) {
            const item = await response.json();
            if (item.image) {
              images.set(upgrade.id, item.image);
            }
          }
        } catch (error) {
          console.error(`Failed to load image for ${upgrade.id}:`, error);
        }
      });

      await Promise.all(promises);

      if (images.size > 0) {
        setItemImages((prev) => new Map([...prev, ...images]));
      }
    };

    if (shopTab === "mejoras") {
      loadItemImages();
    }
  }, [shopTab, upgrades, itemImages]);
  return (
    <>
      <div className={styles.shopTabs} role="tablist">
        <button
          className={`${styles.shopTab} ${shopTab === "mejoras" ? styles.shopTabActive : ""}`}
          onClick={() => onTabChange("mejoras")}
          role="tab"
          aria-selected={shopTab === "mejoras"}
          aria-current={shopTab === "mejoras" ? "page" : undefined}
          type="button"
        >
          Mejoras
        </button>
        <button
          className={`${styles.shopTab} ${shopTab === "sobres" ? styles.shopTabActive : ""}`}
          onClick={() => onTabChange("sobres")}
          role="tab"
          aria-selected={shopTab === "sobres"}
          aria-current={shopTab === "sobres" ? "page" : undefined}
          type="button"
        >
          Sobres
        </button>
      </div>

      <div className={styles.shopContent}>
        {shopTab === "mejoras" ? (
          <div className={styles.upgradesList}>
            {upgrades.map((upgrade) => {
              const canAfford = money >= upgrade.cost;
              const itemImage = itemImages.get(upgrade.id);
              return (
                <div
                  key={upgrade.id}
                  className={`${styles.upgradeCard} ${!canAfford ? styles.upgradeCardDisabled : ""}`}
                >
                  <div className={styles.upgradeIconBubble}>
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={upgrade.name}
                        className={styles.upgradeImage}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      (UPGRADE_ICONS[upgrade.id] ?? "🔵")
                    )}
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
                      onClick={() => onBuyUpgrade(upgrade.id)}
                      disabled={!canAfford}
                      type="button"
                      aria-label={`Comprar ${upgrade.name} por ${upgrade.cost} dinero`}
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
            {packs.map((pack) => {
              const canAfford = money >= pack.cost;
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
                        {pack.probabilities.common}% Común
                      </span>
                    )}
                    {pack.probabilities.epic !== undefined && (
                      <span
                        className={`${styles.rarityPill} ${styles.rarityEpicPill}`}
                      >
                        {pack.probabilities.epic}% Épico
                      </span>
                    )}
                    {pack.probabilities.legendary !== undefined && (
                      <span
                        className={`${styles.rarityPill} ${styles.rarityLegendaryPill}`}
                      >
                        {pack.probabilities.legendary}% Legendario
                      </span>
                    )}
                  </div>
                  <button
                    className={`${styles.packBuyBtn} ${!canAfford ? styles.packBuyBtnDisabled : ""}`}
                    onClick={() => onOpenPack(pack.id)}
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
    </>
  );
}
