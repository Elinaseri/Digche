/**
 * Supabase adapter — the ONLY file in this codebase that imports from
 * @supabase/supabase-js or @supabase/ssr directly.
 *
 * All other modules receive an AppAdapter and never touch Supabase clients.
 * To swap the backend, implement this interface with a different provider.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "./server";
import { createClient as createBrowserClient } from "./client";
import type { AdminRole } from "@/lib/domain/types";

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthAdapter {
  getUser(): Promise<{ id: string; email: string } | null>;
  getUserRole(userId: string): Promise<AdminRole>;
  signInWithPassword(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

function buildAuthAdapter(client: SupabaseClient): AuthAdapter {
  return {
    async getUser() {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user) return null;
      return { id: user.id, email: user.email ?? "" };
    },

    async getUserRole(userId: string) {
      const { data } = await client
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single<{ role: string }>();
      return (data?.role === "admin" ? "admin" : "user") as AdminRole;
    },

    async signInWithPassword(email: string, password: string) {
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
    },

    async signOut() {
      await client.auth.signOut();
    },
  };
}

// ── AppAdapter ────────────────────────────────────────────────────────────────
// Additional slices (icons, storage) are added in Phase 2 / Phase 4.

export interface AppAdapter {
  auth: AuthAdapter;
}

/** Use inside Server Components, Server Actions, and Route Handlers. */
export function createServerAdapter(): AppAdapter {
  return { auth: buildAuthAdapter(createServerClient()) };
}

/** Use inside Client Components that need to talk to Supabase. */
export function createBrowserAdapter(): AppAdapter {
  return { auth: buildAuthAdapter(createBrowserClient()) };
}
