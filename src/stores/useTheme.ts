import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
};

function detectInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("lattice-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.toggle("dark", theme === "dark");
  html.classList.toggle("light", theme === "light");
  localStorage.setItem("lattice-theme", theme);
}

const initial = detectInitial();
apply(initial);

export const useTheme = create<ThemeState>((set, get) => ({
  theme: initial,
  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    apply(next);
    set({ theme: next });
  },
  set: (t) => {
    apply(t);
    set({ theme: t });
  },
}));
