import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionToken,
  isValidAdminSession,
} from "@/lib/admin-session";
import { createAuthRepository } from "@/lib/repositories/authRepository";

function getRepo() {
  return createAuthRepository();
}

export async function requireAdmin(): Promise<{ email: string }> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value ?? "";
  if (!isValidAdminSession(token)) {
    redirect("/admin/login");
  }
  return { email: getRepo().getAdminEmail() };
}

export async function getCurrentUser(): Promise<{ email: string } | null> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value ?? "";
  if (!isValidAdminSession(token)) return null;
  return { email: getRepo().getAdminEmail() };
}

export function checkAdminCredentials(email: string, password: string): boolean {
  return getRepo().checkCredentials(email, password);
}

export function getSessionCookieConfig() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: getAdminSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
}
