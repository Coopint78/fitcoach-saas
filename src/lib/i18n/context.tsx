"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, type Lang } from "./translations";

type T = (section: string, key: string) => string;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: T;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectBrowserLang(): Lang {
  if (typeof window === "undefined") return "es";
  const nav = navigator.language || (navigator as any).userLanguage || "es";
  return nav.toLowerCase().startsWith("en") ? "en" : "es";
}

function resolve(lang: Lang, section: string, key: string): string {
  const sec = (translations[lang] as any)[section];
  return sec?.[key] ?? (translations.es as any)[section]?.[key] ?? key;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const stored = localStorage.getItem("fitcoach-lang") as Lang | null;
    setLangState(stored ?? detectBrowserLang());
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("fitcoach-lang", l);
    document.cookie = `fitcoach-lang=${l};path=/;max-age=31536000`;
  }

  const t: T = (section, key) => resolve(lang, section, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
