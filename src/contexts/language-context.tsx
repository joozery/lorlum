"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "th" | "en";

interface LangCtxValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangCtx = createContext<LangCtxValue>({ lang: "th", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("th");

  useEffect(() => {
    const saved = localStorage.getItem("admin-lang") as Lang | null;
    if (saved === "th" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("admin-lang", l);
  };

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export const useLanguage = () => useContext(LangCtx);
