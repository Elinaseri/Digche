"use server";

import { revalidatePath } from "next/cache";
import { publishIcon, unpublishIcon, deleteIcon } from "@/lib/services/icons";

export async function publishIconAction(id: string): Promise<{ error?: string }> {
  try {
    await publishIcon(id);
    revalidatePath("/admin/icons");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to publish." };
  }
}

export async function unpublishIconAction(id: string): Promise<{ error?: string }> {
  try {
    await unpublishIcon(id);
    revalidatePath("/admin/icons");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to unpublish." };
  }
}

export async function deleteIconAction(id: string): Promise<{ error?: string }> {
  try {
    await deleteIcon(id);
    revalidatePath("/admin/icons");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete." };
  }
}
