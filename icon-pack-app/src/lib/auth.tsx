"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type Plan = "free" | "premium";

interface AuthContextValue {
  user: User | null;
  plan: Plan;
  isLoading: boolean;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<Plan>("free");
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchPlan = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", userId)
        .single();
      setPlan((data?.plan as Plan) ?? "free");
    },
    [supabase]
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        try {
          await fetchPlan(currentUser.id);
        } catch {
          setPlan("free");
        }
      } else {
        setPlan("free");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchPlan]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{ user, plan, isLoading, authModalOpen, openAuthModal, closeAuthModal, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
