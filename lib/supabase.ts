import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

export const isSupabaseConfigured = url.startsWith("https://") && publishableKey.startsWith("sb_publishable_");
const isWebServerRender = Platform.OS === "web" && typeof window === "undefined";
const serverStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
};

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
      storage: isWebServerRender ? serverStorage : AsyncStorage,
      autoRefreshToken: !isWebServerRender,
      persistSession: !isWebServerRender,
      detectSessionInUrl: false,
    },
  },
);
