"use server";

import { signOutAdmin } from "@/lib/services/auth";
import { redirect } from "next/navigation";

export async function signOutAction() {
  await signOutAdmin();
  redirect("/admin/login");
}
