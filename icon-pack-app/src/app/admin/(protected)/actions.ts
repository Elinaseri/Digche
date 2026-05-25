"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

export async function signOutAction() {
  cookies().delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
