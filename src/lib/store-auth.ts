import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET ?? "lorlum_secret_change_me";
const COOKIE = "store_token";

export interface StoreSession {
  customerId: string;
  email:      string;
}

export function signToken(payload: StoreSession): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): StoreSession | null {
  try {
    return jwt.verify(token, SECRET) as StoreSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<StoreSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const COOKIE_NAME = COOKIE;
export const COOKIE_OPTIONS = {
  httpOnly:  true,
  secure:    process.env.NODE_ENV === "production",
  sameSite:  "lax" as const,
  path:      "/",
  maxAge:    60 * 60 * 24 * 30,
};
