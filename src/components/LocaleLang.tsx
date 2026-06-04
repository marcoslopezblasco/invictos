"use client";

import { useEffect } from "react";
import { useGame } from "@/context/GameContext";

export function LocaleLang() {
  const { locale } = useGame();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
