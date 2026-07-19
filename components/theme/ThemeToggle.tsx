"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    __anulenApplyTheme?: (theme: "light" | "dark") => void;
    __anulenGetSystemTheme?: () => "light" | "dark";
    __anulenGetPreferredTheme?: () => "light" | "dark";
  }
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (theme: "light" | "dark") => {
      if (window.__anulenApplyTheme) {
        window.__anulenApplyTheme(theme);
      } else {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.style.colorScheme = theme;
      }

      setIsDark(theme === "dark");
    };

    const getPreferredTheme = () => window.__anulenGetPreferredTheme?.() || (mediaQuery.matches ? "dark" : "light");
    const syncTheme = () => applyTheme(getPreferredTheme());
    const syncSystemTheme = () => applyTheme(mediaQuery.matches ? "dark" : "light");

    syncTheme();

    mediaQuery.addEventListener("change", syncSystemTheme);

    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    const nextTheme = nextIsDark ? "dark" : "light";

    window.__anulenApplyTheme?.(nextTheme);
    if (!window.__anulenApplyTheme) {
      document.documentElement.classList.toggle("dark", nextIsDark);
      document.documentElement.style.colorScheme = nextTheme;
    }

    setIsDark(nextIsDark);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-[#f7f7f4] text-black transition hover:bg-black hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-black"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
