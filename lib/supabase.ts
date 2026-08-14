import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

if (Platform.OS !== "web") {
  require("react-native-url-polyfill/auto");
}

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

export const isSupabaseConfigured = url.startsWith("https://") && publishableKey.startsWith("sb_publishable_");
const isWebServerRender = Platform.OS === "web" && typeof window === "undefined";
const serverStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
};
const browserStorage = {
  getItem: async (key: string) => (typeof window === "undefined" ? null : window.localStorage.getItem(key)),
  setItem: async (key: string, value: string) => { if (typeof window !== "undefined") window.localStorage.setItem(key, value); },
  removeItem: async (key: string) => { if (typeof window !== "undefined") window.localStorage.removeItem(key); },
};
const nativeStorage = Platform.OS === "web" ? null : require("@react-native-async-storage/async-storage").default;
const authStorage = isWebServerRender ? serverStorage : Platform.OS === "web" ? browserStorage : nativeStorage;

if (!isSupabaseConfigured) {
  console.warn("[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

/**
 * Supabase recommends an explicit React Native storage adapter. The session
 * contains refresh data and must never be written to the product/cart cache.
 */
export const supabase = createClient(
  isSupabaseConfigured ? url : "https://invalid.supabase.co",
  isSupabaseConfigured ? publishableKey : "invalid-publishable-key",
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: !isWebServerRender,
      persistSession: !isWebServerRender,
      detectSessionInUrl: false,
    },
  },
);
