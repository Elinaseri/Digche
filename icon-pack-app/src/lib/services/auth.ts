/**
 * Auth service — app-level functions the UI calls.
 * No Supabase imports here; all data access goes through the adapter → repository.
 */

import { redirect } from "next/navigation";
import { createServerAdapter } from "@/lib/supabase/adapter";
import { createAuthRepository } from "@/lib/repositories/authRepository";

function getRepo() {
  const adapter = createServerAdapter();
  return createAuthRepository(adapter.auth);
}

/** Returns the currently authenticated user, or null. */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
} | null> {
  return getRepo().getCurrentUser();
}

/** Returns true only if the current user has the admin role. */
export async function isAdmin(): Promise<boolean> {
  const repo = getRepo();
  const user = await repo.getCurrentUser();
  if (!user) return false;
  const role = await repo.getUserRole(user.id);
  return role === "admin";
}

/**
 * Asserts the current user is an admin.
 * Redirects to /admin/login if not authenticated or not an admin.
 * Use this at the top of every protected Server Component or Server Action.
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const repo = getRepo();
  const user = await repo.getCurrentUser();
  if (!user) redirect("/admin/login");
  const role = await repo.getUserRole(user.id);
  if (role !== "admin") redirect("/admin/login");
  return user;
}

/** Signs in with email + password. Throws on invalid credentials. */
export async function signInAdmin(
  email: string,
  password: string
): Promise<void> {
  await getRepo().signIn(email, password);
}

/** Signs out the current user. */
export async function signOutAdmin(): Promise<void> {
  await getRepo().signOut();
}
