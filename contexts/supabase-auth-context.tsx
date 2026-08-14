import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { detectAuthIdentifier, normalizeThaiPhone } from "@/lib/auth-credentials";

type SupabaseAuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signInWithPassword: (identifier: string, password: string) => Promise<void>;
  signUpWithPassword: (identifier: string, password: string, displayName?: string) => Promise<Session | null>;
  requestPasswordReset: (email: string) => Promise<void>;
  completePasswordRecovery: (url: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

export function SupabaseAuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signInWithPassword = useCallback(async (identifier: string, password: string) => {
    if (!isSupabaseConfigured) throw new Error("ยังไม่ได้ตั้งค่า Supabase สำหรับแอป");
    const kind = detectAuthIdentifier(identifier);
    if (kind === "invalid") throw new Error("กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ให้ถูกต้อง");
    const credentials = kind === "email"
      ? { email: identifier.trim().toLowerCase(), password }
      : { phone: normalizeThaiPhone(identifier), password };
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    setSession(data.session);
  }, []);

  const signUpWithPassword = useCallback(async (identifier: string, password: string, displayName?: string) => {
    if (!isSupabaseConfigured) throw new Error("ยังไม่ได้ตั้งค่า Supabase สำหรับแอป");
    const kind = detectAuthIdentifier(identifier);
    if (kind === "invalid") throw new Error("กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ให้ถูกต้อง");
    const data = displayName?.trim() ? { display_name: displayName.trim() } : undefined;
    const payload = kind === "email"
      ? { email: identifier.trim().toLowerCase(), password, options: { data, emailRedirectTo: Linking.createURL("auth") } }
      : { phone: normalizeThaiPhone(identifier), password, options: { data } };
    const { data: authData, error } = await supabase.auth.signUp(payload);
    if (error) throw error;
    setSession(authData.session);
    return authData.session;
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) throw new Error("ยังไม่ได้ตั้งค่า Supabase สำหรับแอป");
    if (detectAuthIdentifier(email) !== "email") throw new Error("กรุณากรอกอีเมลที่ถูกต้องเพื่อรีเซ็ตรหัสผ่าน");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: Linking.createURL("auth/reset-password") });
    if (error) throw error;
  }, []);

  const completePasswordRecovery = useCallback(async (url: string) => {
    if (!isSupabaseConfigured) return false;
    const query = url.includes("?") ? url.split("?")[1]?.split("#")[0] ?? "" : "";
    const hash = url.includes("#") ? url.split("#")[1] : "";
    const params = new URLSearchParams(`${query}&${hash}`);
    const code = params.get("code");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      setSession(data.session);
      return Boolean(data.session);
    }
    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (error) throw error;
      setSession(data.session);
      return Boolean(data.session);
    }
    return false;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!isSupabaseConfigured) throw new Error("ยังไม่ได้ตั้งค่า Supabase สำหรับแอป");
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    setSession((current) => current ? { ...current, user: data.user ?? current.user } : current);
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo<SupabaseAuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: isSupabaseConfigured,
      signInWithPassword,
      signUpWithPassword,
      requestPasswordReset,
      completePasswordRecovery,
      updatePassword,
      signOut,
    }),
    [loading, session, signInWithPassword, signUpWithPassword, requestPasswordReset, completePasswordRecovery, updatePassword, signOut],
  );

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) throw new Error("useSupabaseAuth must be used inside SupabaseAuthProvider");
  return context;
}
