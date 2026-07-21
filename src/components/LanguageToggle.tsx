"use client";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      className="w-9 h-9 p-0 text-xs font-bold text-current hover:bg-white/10"
    >
      {lang === "es" ? "EN" : "ES"}
    </Button>
  );
}
