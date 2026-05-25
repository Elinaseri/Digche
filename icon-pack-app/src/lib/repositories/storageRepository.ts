import type { StorageAdapter } from "@/lib/supabase/adapter";
import type { IconStyle } from "@/lib/domain/types";

const BUCKET = "icon-assets";

function variantPath(slug: string, style: IconStyle): string {
  return `icons/${slug}/${style}.svg`;
}

export interface StorageRepository {
  uploadVariant(
    slug: string,
    style: IconStyle,
    svgBuffer: ArrayBuffer
  ): Promise<string>;
  removeVariant(slug: string, style: IconStyle): Promise<void>;
  getVariantUrl(slug: string, style: IconStyle): string;
}

export function createStorageRepository(
  storage: StorageAdapter
): StorageRepository {
  return {
    async uploadVariant(slug, style, svgBuffer) {
      const path = variantPath(slug, style);
      await storage.upload(BUCKET, path, svgBuffer, "image/svg+xml");
      return path;
    },

    async removeVariant(slug, style) {
      await storage.remove(BUCKET, [variantPath(slug, style)]);
    },

    getVariantUrl(slug, style) {
      return storage.getPublicUrl(BUCKET, variantPath(slug, style));
    },
  };
}
