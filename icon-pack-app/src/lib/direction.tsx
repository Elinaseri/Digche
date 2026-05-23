"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Direction = "ltr" | "rtl";

const STORAGE_KEY = "digche-dir";

interface DirectionContextValue {
  dir: Direction;
  toggleDirection: () => void;
  setDirection: (d: Direction) => void;
}

const DirectionContext = createContext<DirectionContextValue | null>(null);

function applyDirection(dir: Direction) {
  document.documentElement.setAttribute("dir", dir);
}

/** Render-blocking script that sets `dir` before paint (no layout flash). */
export const directionInitScript = `(function(){try{var d=localStorage.getItem('${STORAGE_KEY}')||'ltr';document.documentElement.setAttribute('dir',d);}catch(e){}})();`;

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [dir, setDirState] = useState<Direction>("ltr");

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("dir") as Direction) || "ltr";
    setDirState(current);
  }, []);

  const setDirection = useCallback((d: Direction) => {
    setDirState(d);
    applyDirection(d);
    try {
      localStorage.setItem(STORAGE_KEY, d);
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, []);

  const toggleDirection = useCallback(() => {
    setDirection(dir === "rtl" ? "ltr" : "rtl");
  }, [dir, setDirection]);

  return (
    <DirectionContext.Provider value={{ dir, toggleDirection, setDirection }}>
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection(): DirectionContextValue {
  const ctx = useContext(DirectionContext);
  if (!ctx) throw new Error("useDirection must be used within a DirectionProvider");
  return ctx;
}
