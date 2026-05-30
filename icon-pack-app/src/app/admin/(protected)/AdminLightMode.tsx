"use client";

import { useEffect } from "react";

/** Forces light mode while the admin panel is mounted, then restores the previous theme. */
export default function AdminLightMode() {
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    return () => {
      if (wasDark) {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      }
    };
  }, []);
  return null;
}
