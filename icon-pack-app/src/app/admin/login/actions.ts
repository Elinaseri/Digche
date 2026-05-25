"use server";

import { signInAdmin } from "@/lib/services/auth";

export async function signInAction(
  formData: FormData
): Promise<{ error: string } | null> {
  const email = ((formData.get("email") as string | null) ?? "").trim();
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signInAdmin(email, password);
    return null; // success — client handles redirect
  } catch {
    return { error: "Invalid email or password." };
  }
}
