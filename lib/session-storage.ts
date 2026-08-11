import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "hobee.auth.token";

function getWebStorage() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

/** Stores only small authentication tokens. Profile and cart data belong in non-sensitive storage. */
export const sessionStorage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === "web") return getWebStorage()?.getItem(TOKEN_KEY) ?? null;
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      getWebStorage()?.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clearToken(): Promise<void> {
    if (Platform.OS === "web") {
      getWebStorage()?.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

