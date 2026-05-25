"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { themes, getThemeById, buildThemeCSS } from "@/themes/config";
import type { ThemePreset } from "@/types/editor";

const STORAGE_KEY = "tactix-theme-preset";
const STYLE_ID = "theme-preset-variables";

interface ThemePresetContextValue {
  activeThemeId: string;
  activeTheme: ThemePreset;
  setThemePreset: (id: string) => void;
  themes: ThemePreset[];
}

const ThemePresetContext = createContext<ThemePresetContextValue | null>(null);

function applyThemeCSS(css: string) {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = css;
}

function removeThemeCSS() {
  const style = document.getElementById(STYLE_ID);
  if (style) style.remove();
}

export function ThemePresetProvider({ children }: { children: ReactNode }) {
  const [activeThemeId, setActiveThemeId] = useState<string>("phosphor");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && getThemeById(stored)) {
      setActiveThemeId(stored);
    } else {
      setActiveThemeId("phosphor");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const theme = getThemeById(activeThemeId);
    if (theme) {
      const css = buildThemeCSS(theme);
      applyThemeCSS(css);
    }
  }, [activeThemeId, mounted]);

  const setThemePreset = useCallback((id: string) => {
    const theme = getThemeById(id);
    if (!theme) return;
    setActiveThemeId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const activeTheme = getThemeById(activeThemeId) ?? themes[0];

  return (
    <ThemePresetContext.Provider
      value={{ activeThemeId, activeTheme, setThemePreset, themes }}
    >
      {children}
    </ThemePresetContext.Provider>
  );
}

export function useThemePreset(): ThemePresetContextValue {
  const ctx = useContext(ThemePresetContext);
  if (!ctx) {
    throw new Error("useThemePreset must be used within a ThemePresetProvider");
  }
  return ctx;
}
