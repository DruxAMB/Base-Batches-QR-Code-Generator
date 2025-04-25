"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const themes = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "system", label: "System" },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
      }
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
  }, []);

  return (
    <div className="flex gap-2 items-center justify-center mb-4">
      {themes.map((t) => (
        <Button
          key={t.key}
          type="button"
          size="sm"
          variant={theme === t.key ? "default" : "outline"}
          onClick={() => setTheme(t.key)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
