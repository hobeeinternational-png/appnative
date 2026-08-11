import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { type AppLocale, translate, type TranslationKey } from "@/lib/localization";

const LOCALE_STORAGE_KEY = "hobee.locale.v1";

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setCurrentLocale] = useState<AppLocale>("th");

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      .then((saved) => {
        if (saved === "th" || saved === "en") setCurrentLocale(saved);
      })
      .catch(() => {});
  }, []);

  const setLocale = (nextLocale: AppLocale) => {
    setCurrentLocale(nextLocale);
    void AsyncStorage.setItem(LOCALE_STORAGE_KEY, nextLocale).catch(() => {});
  };

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: (key) => translate(locale, key) }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}

