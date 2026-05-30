"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createDraftIcon, addVariantToIcon, checkSlugAvailable } from "@/lib/services/icons";
import { PUBLIC_ICONS_TAG } from "@/lib/services/publicIcons";
import type { IconStyle } from "@/lib/domain/types";

const VALID_STYLES: IconStyle[] = ["Bold", "Bulk", "Linear", "Outline"];

interface BulkVariant {
  style: IconStyle;
  svgContent: string;
}

interface BulkIconInput {
  name: string;
  slug: string;
  pascalName: string;
  category: string;
  categorySlug: string;
  variants: BulkVariant[];
}

export async function bulkCreateIconsAction(
  icons: BulkIconInput[]
): Promise<{ created: number; skipped: string[]; errors: string[] }> {
  let created = 0;
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const icon of icons) {
    try {
      const available = await checkSlugAvailable(icon.slug);
      if (!available) {
        skipped.push(icon.name);
        continue;
      }

      const newIcon = await createDraftIcon({
        name: icon.name,
        slug: icon.slug,
        pascalName: icon.pascalName,
        category: icon.category,
        categorySlug: icon.categorySlug,
        tags: [],
        isPremium: false,
      });

      for (const variant of icon.variants) {
        if (!VALID_STYLES.includes(variant.style)) continue;
        await addVariantToIcon({
          iconId: newIcon.id,
          iconSlug: newIcon.slug,
          style: variant.style,
          svgContent: variant.svgContent,
        });
      }

      created++;
    } catch (err) {
      errors.push(`${icon.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  revalidatePath("/admin/icons");
  revalidatePath("/admin/dashboard");
  revalidateTag(PUBLIC_ICONS_TAG);

  return { created, skipped, errors };
}
