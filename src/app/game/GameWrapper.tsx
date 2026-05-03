"use client";

import dynamic from "next/dynamic";

const GameClient = dynamic(() => import("./GameClient"), { ssr: false });

export default function GameWrapper() {
  return <GameClient />;
}
