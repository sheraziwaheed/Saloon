"use client";
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("luxe-theme");
      } catch {
        // The toggle still works when browser storage is unavailable.
      }
      document.documentElement.dataset.theme =
        saved === "light" || saved === "dark"
          ? saved
          : preference.matches
            ? "dark"
            : "light";
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key === "luxe-theme" || event.key === null) syncTheme();
    };
    syncTheme();
    preference.addEventListener("change", syncTheme);
    window.addEventListener("storage", syncStorage);
    return () => {
      preference.removeEventListener("change", syncTheme);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
      onClick={() => {
        const root = document.documentElement;
        const theme = root.dataset.theme === "light" ? "dark" : "light";
        root.dataset.theme = theme;
        try {
          localStorage.setItem("luxe-theme", theme);
        } catch {
          // Apply the theme for this page even if it cannot be saved.
        }
      }}
    >
      <Sun size={18} className="theme-toggle-sun" aria-hidden="true" />
      <Moon size={18} className="theme-toggle-moon" aria-hidden="true" />
    </button>
  );
}
