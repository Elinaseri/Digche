import type { IconStyle } from "@/lib/types";

export type { IconStyle };

export type IconStatus = "draft" | "published";
export type AdminRole = "user" | "admin";

export interface IconVariant {
  id: string;
  iconId: string;
  style: IconStyle;
  storagePath: string;
  svgBody: string;
  createdAt: Date;
}

export interface AdminIcon {
  id: string;
  name: string;
  slug: string;
  pascalName: string;
  category: string;
  categorySlug: string;
  tags: string[];
  isPremium: boolean;
  status: IconStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: string | null;
  variants: IconVariant[];
}

export interface CreateIconInput {
  name: string;
  slug: string;
  pascalName: string;
  category: string;
  categorySlug: string;
  tags?: string[];
  isPremium?: boolean;
}

export interface UpdateIconInput {
  name?: string;
  pascalName?: string;
  category?: string;
  categorySlug?: string;
  tags?: string[];
  isPremium?: boolean;
}

export interface CreateVariantInput {
  iconId: string;
  style: IconStyle;
  svgBody: string;
  file: ArrayBuffer;
}
