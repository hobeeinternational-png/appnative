export type AppLocale = "th" | "en";

const translations = {
  th: {
    "tab.home": "หน้าแรก",
    "tab.shop": "ร้านค้า",
    "tab.discover": "ค้นพบ",
    "tab.account": "บัญชี",
    "language.title": "ภาษา",
    "language.th": "ไทย",
    "language.en": "English",
  },
  en: {
    "tab.home": "Home",
    "tab.shop": "Shop",
    "tab.discover": "Discover",
    "tab.account": "Account",
    "language.title": "Language",
    "language.th": "ไทย",
    "language.en": "English",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["th"];

export function translate(locale: AppLocale, key: TranslationKey): string {
  return translations[locale][key];
}

