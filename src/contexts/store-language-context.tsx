"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type StoreLang = "en" | "th";

interface StoreLangCtxValue {
  lang: StoreLang;
  setLang: (l: StoreLang) => void;
}

const StoreLangCtx = createContext<StoreLangCtxValue>({ lang: "en", setLang: () => {} });

export function StoreLanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<StoreLang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("store-lang") as StoreLang | null;
    if (saved === "en" || saved === "th") setLangState(saved);
  }, []);

  const setLang = (l: StoreLang) => {
    setLangState(l);
    localStorage.setItem("store-lang", l);
  };

  return <StoreLangCtx.Provider value={{ lang, setLang }}>{children}</StoreLangCtx.Provider>;
}

export const useStoreLang = () => useContext(StoreLangCtx);
