"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type ThemePreference = "SYSTEM" | "LIGHT" | "DARK";

function applyTheme(themePreference: ThemePreference) {
  const root = document.documentElement;

  if (themePreference === "SYSTEM") {
    const darkBySystem = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", darkBySystem);
    return;
  }

  root.classList.toggle("dark", themePreference === "DARK");
}

export default function ThemeController() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/f/")) {
      document.documentElement.classList.remove("dark");
      return;
    }

    let alive = true;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    async function loadTheme() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json();
      if (!alive) return;

      const pref = (data?.user?.themePreference || "SYSTEM") as ThemePreference;
      applyTheme(pref);

      const onSystemThemeChanged = () => {
        if (pref === "SYSTEM") {
          applyTheme("SYSTEM");
        }
      };

      media.addEventListener("change", onSystemThemeChanged);
      return () => media.removeEventListener("change", onSystemThemeChanged);
    }

    let cleanup: (() => void) | undefined;
    void loadTheme().then((fn) => {
      cleanup = fn;
    });

    return () => {
      alive = false;
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
