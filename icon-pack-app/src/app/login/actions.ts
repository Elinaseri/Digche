"use server";

import { createClient } from "@/lib/supabase/server";

export async function signInWithEmailAction(
  email: string,
  password: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return {};
}

export async function signUpWithEmailAction(
  name: string,
  email: string,
  password: string
): Promise<{ error?: string; needsConfirmation?: boolean }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name.trim() } },
  });
  if (error) return { error: error.message };
  // If email confirmation is required, identities will be empty
  if (!data.session && data.user?.identities?.length === 0) {
    return { error: "An account with this email already exists." };
  }
  if (!data.session) return { needsConfirmation: true };
  return {};
}
