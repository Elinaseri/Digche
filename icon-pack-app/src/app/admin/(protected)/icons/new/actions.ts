"use server";

import { createDraftIcon, addVariantToIcon } from "@/lib/services/icons";
import { slugify } from "@/lib/svg-utils";
import type { IconStyle } from "@/lib/domain/types";

const STYLES: IconStyle[] = ["Bold", "Bulk", "Linear", "Outline"];

export async function createIconAction(
  formData: FormData
): Promise<{ error: string } | null> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const slug = (formData.get("slug") as string | null)?.trim() ?? "";
  const pascalName = (formData.get("pascalName") as string | null)?.trim() ?? "";
  const category = (formData.get("category") as string | null)?.trim() ?? "";
  const categorySlug = slugify(category);
  const tagsRaw = (formData.get("tags") as string | null)?.trim() ?? "";
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const isPremium = formData.get("isPremium") === "true";

  if (!name || !slug || !category) {
    return { error: "Name, slug, and category are required." };
  }

  const variantEntries = STYLES.map((style) => ({
    style,
    content: (formData.get(`variant_${style}`) as string | null) ?? null,
  })).filter((v) => v.content !== null);

  if (variantEntries.length === 0) {
    return { error: "At least one SVG variant is required." };
  }

  try {
    const icon = await createDraftIcon({
      name,
      slug,
      pascalName,
      category,
      categorySlug,
      tags,
      isPremium,
    });

    for (const { style, content } of variantEntries) {
      await addVariantToIcon({
        iconId: icon.id,
        iconSlug: icon.slug,
        style,
        svgContent: content!,
      });
    }

    return null;
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to create icon.",
    };
  }
}
