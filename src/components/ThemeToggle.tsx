"use client";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme/context";

export default function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme();
  if (!mounted) return <div className="w-9 h-9" />;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="w-9 h-9 p-0 text-current hover:bg-white/10"
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark"
        ? <Sun className="h-4 w-4" />
        : <Moon className="h-4 w-4" />}
    </Button>
  );
}
