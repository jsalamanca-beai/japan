import { cookies } from "next/headers";

const COOKIE_NAME = "jp_session";
const PASSWORD = "260522";
const SESSION_VALUE = "authenticated";

export function verifyPassword(input: string): boolean {
  return input === PASSWORD;
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = cookies();
  (await cookieStore).set(COOKIE_NAME, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = cookies();
  (await cookieStore).delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const session = (await cookieStore).get(COOKIE_NAME);
  return session?.value === SESSION_VALUE;
}
