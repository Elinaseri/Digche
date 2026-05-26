import { unstable_cache } from "next/cache";
import { createPublicAdapter } from "@/lib/supabase/adapter";
import type { Manifest, IconBodies, IconStyle } from "@/lib/types";

export const PUBLIC_ICONS_TAG = "published-icons";

async function fetchPublishedDbIcons() {
  const adapter = createPublicAdapter();
  return adapter.icons.listPublished();
}

export const getPublishedDbIcons = unstable_cache(
  fetchPublishedDbIcons,
  [PUBLIC_ICONS_TAG],
  { revalidate: 60, tags: [PUBLIC_ICONS_TAG] }
);

export function mergeWithStatic(
  staticManifest: Manifest,
  staticBodies: IconBodies,
  dbIcons: Awaited<ReturnType<typeof fetchPublishedDbIcons>>
): { manifest: Manifest; bodies: IconBodies } {
  if (dbIcons.length === 0) {
    return { manifest: staticManifest, bodies: staticBodies };
  }

  // Build a set of static slugs for collision detection
  const staticSlugs = new Set(staticManifest.icons.map((i) => i.slug));

  // Convert DB icons to IconMeta
  const dbMeta = dbIcons.map((icon) => ({
    name: icon.name,
    slug: icon.slug,
    pascalName: icon.pascalName,
    category: icon.category,
    categorySlug: icon.categorySlug,
    availableStyles: icon.variants.map((v) => v.style as IconStyle),
    isPremium: icon.isPremium || undefined,
  }));

  // DB icons that are new (no slug collision with static)
  const newDbMeta = dbMeta.filter((m) => !staticSlugs.has(m.slug));

  // Merged icon list: static first, then new DB icons (no overrides for now)
  const mergedIcons = [...staticManifest.icons, ...newDbMeta];

  // Merge categories
  const mergedCategories = { ...staticManifest.categories };
  for (const icon of dbIcons) {
    if (!mergedCategories[icon.categorySlug]) {
      mergedCategories[icon.categorySlug] = icon.category;
    }
  }

  // Merge bodies
  const mergedBodies: IconBodies = { ...staticBodies };
  for (const icon of dbIcons) {
    if (staticSlugs.has(icon.slug)) continue; // skip collisions
    mergedBodies[icon.slug] = Object.fromEntries(
      icon.variants.map((v) => [v.style, v.svgBody])
    ) as Partial<Record<IconStyle, string>>;
  }

  return {
    manifest: {
      icons: mergedIcons,
      categories: mergedCategories,
      styles: staticManifest.styles,
      total: mergedIcons.length,
    },
    bodies: mergedBodies,
  };
}
