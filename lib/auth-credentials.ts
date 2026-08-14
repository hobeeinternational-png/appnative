export type AuthIdentifierKind = "email" | "phone" | "invalid";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeThaiPhone(value: string) {
  const compact = value.trim().replace(/[\s()-]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("66")) return `+${compact}`;
  if (compact.startsWith("0") && /^0\d{8,9}$/.test(compact)) return `+66${compact.slice(1)}`;
  return compact;
}

export function detectAuthIdentifier(value: string): AuthIdentifierKind {
  const compact = value.trim();
  if (EMAIL_PATTERN.test(compact)) return "email";
  return /^\+[1-9]\d{7,14}$/.test(normalizeThaiPhone(compact)) ? "phone" : "invalid";
}

export function credentialHint(value: string) {
  const kind = detectAuthIdentifier(value);
  if (kind === "phone") return "จะใช้เบอร์โทรศัพท์สำหรับเข้าสู่ระบบ";
  if (kind === "email") return "จะใช้อีเมลสำหรับเข้าสู่ระบบ";
  return "รองรับอีเมล หรือเบอร์โทรศัพท์ไทย";
}

export function isPasswordValid(value: string) {
  return value.trim().length >= 6;
}

export function mapAuthError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("invalid login credentials") || message.includes("invalid credentials")) return "อีเมล/เบอร์โทรศัพท์ หรือรหัสผ่านไม่ถูกต้อง";
  if (message.includes("email not confirmed")) return "กรุณายืนยันอีเมลจากกล่องจดหมายก่อนเข้าสู่ระบบ";
  if (message.includes("phone") && (message.includes("not enabled") || message.includes("unsupported"))) return "การเข้าสู่ระบบด้วยเบอร์โทรศัพท์ยังไม่ได้เปิดใช้งาน";
  if (message.includes("user already registered") || message.includes("already registered")) return "อีเมลหรือเบอร์โทรศัพท์นี้มีบัญชี HOBEE อยู่แล้ว";
  if (message.includes("password should be") || message.includes("weak password")) return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
  if (message.includes("rate limit") || message.includes("too many")) return "มีการทำรายการมากเกินไป กรุณาลองใหม่ภายหลัง";
  if (message.includes("network") || message.includes("fetch")) return "ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบอินเทอร์เน็ต";
  if (message.includes("banned") || message.includes("disabled") || message.includes("blocked")) return "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อศูนย์ช่วยเหลือ";
  return "ไม่สามารถดำเนินการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
}
