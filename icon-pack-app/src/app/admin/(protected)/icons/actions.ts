"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { publishIcon, unpublishIcon, deleteIcon, renameCategory, deleteEmptyCategory } from "@/lib/services/icons";
import { PUBLIC_ICONS_TAG } from "@/lib/services/publicIcons";

export async function publishIconAction(id: string): Promise<{ error?: string }> {
  try {
    await publishIcon(id);
    revalidatePath("/admin/icons");
    revalidatePath("/admin/dashboard");
    revalidateTag(PUBLIC_ICONS_TAG);
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
    revalidateTag(PUBLIC_ICONS_TAG);
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
    revalidateTag(PUBLIC_ICONS_TAG);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete." };
  }
}

export async function deleteCategoryAction(slug: string): Promise<{ error?: string }> {
  if (!slug) return { error: "Invalid slug." };
  try {
    await deleteEmptyCategory(slug);
    revalidatePath("/admin/icons");
    revalidateTag(PUBLIC_ICONS_TAG);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete category." };
  }
}

export async function renameCategoryAction(
  oldSlug: string,
  newName: string,
  newSlug: string
): Promise<{ error?: string }> {
  const name = newName.trim();
  if (!name) return { error: "Category name cannot be empty." };
  try {
    await renameCategory(oldSlug, name, newSlug);
    revalidatePath("/admin/icons");
    revalidateTag(PUBLIC_ICONS_TAG);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to rename category." };
  }
}
