"use server";

import { revalidatePath } from "next/cache";
import {
  updateIcon,
  addVariantToIcon,
  removeVariantFromIcon,
} from "@/lib/services/icons";
import { slugify, toPascalCase } from "@/lib/svg-utils";
import type { IconStyle } from "@/lib/domain/types";

const STYLES: IconStyle[] = ["Bold", "Bulk", "Linear", "Outline"];

export async function updateIconAction(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const category = (formData.get("category") as string | null)?.trim() ?? "";
  const tagsRaw = (formData.get("tags") as string | null)?.trim() ?? "";
  const isPremium = formData.get("isPremium") === "true";

  if (!name || !category) {
    return { error: "Name and category are required." };
  }

  try {
    await updateIcon(id, {
      name,
      pascalName: toPascalCase(name),
      category,
      categorySlug: slugify(category),
      tags: tagsRaw
        ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      isPremium,
    });
    revalidatePath("/admin/icons");
    revalidatePath(`/admin/icons/${id}/edit`);
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update." };
  }
}

export async function addVariantAction(
  iconId: string,
  iconSlug: string,
  formData: FormData
): Promise<{ error?: string }> {
  for (const style of STYLES) {
    const content = formData.get(`variant_${style}`) as string | null;
    if (!content) continue;
    try {
      await addVariantToIcon({ iconId, iconSlug, style, svgContent: content });
    } catch (err) {
      return {
        error: `${style}: ${err instanceof Error ? err.message : "Upload failed."}`,
      };
    }
  }
  revalidatePath(`/admin/icons/${iconId}/edit`);
  return {};
}

export async function removeVariantAction(
  variantId: string,
  iconId: string
): Promise<{ error?: string }> {
  try {
    await removeVariantFromIcon(variantId);
    revalidatePath(`/admin/icons/${iconId}/edit`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to remove." };
  }
}
