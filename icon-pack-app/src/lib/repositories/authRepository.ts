import type { AuthAdapter } from "@/lib/supabase/adapter";
import type { AdminRole } from "@/lib/domain/types";

export interface AuthRepository {
  getCurrentUser(): Promise<{ id: string; email: string } | null>;
  getUserRole(userId: string): Promise<AdminRole>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

export function createAuthRepository(auth: AuthAdapter): AuthRepository {
  return {
    getCurrentUser: () => auth.getUser(),
    getUserRole: (userId: string) => auth.getUserRole(userId),
    signIn: (email: string, password: string) =>
      auth.signInWithPassword(email, password),
    signOut: () => auth.signOut(),
  };
}
