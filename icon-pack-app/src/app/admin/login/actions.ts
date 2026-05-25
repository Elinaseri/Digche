"use server";

import { cookies } from "next/headers";
import { checkAdminCredentials, getSessionCookieConfig } from "@/lib/services/auth";

export async function signInAction(
  formData: FormData
): Promise<{ error: string } | null> {
  const email = ((formData.get("email") as string | null) ?? "").trim();
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (!checkAdminCredentials(email, password)) {
    return { error: "Invalid email or password." };
  }

  const { name, value, ...options } = getSessionCookieConfig();
  cookies().set(name, value, options);

  return null;
}
