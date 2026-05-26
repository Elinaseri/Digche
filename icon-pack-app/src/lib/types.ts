export type IconStyle = "Bold" | "Bulk" | "Linear" | "Outline";

export interface IconMeta {
  name: string;
  slug: string;
  pascalName: string;
  category: string;
  categorySlug: string;
  availableStyles: IconStyle[];
  tags?: string[];
  isPremium?: boolean;
}

export interface Manifest {
  icons: IconMeta[];
  categories: Record<string, string>;
  styles: IconStyle[];
  total: number;
}

export type IconBodies = Record<string, Partial<Record<IconStyle, string>>>;
