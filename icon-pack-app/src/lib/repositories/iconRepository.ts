import type {
  IconsDbAdapter,
  IconDbRow,
  VariantDbRow,
  InsertIconData,
  InsertVariantData,
  UpdateIconData,
} from "@/lib/supabase/adapter";
import type { AdminIcon, IconVariant, IconStatus } from "@/lib/domain/types";

function toIconVariant(row: VariantDbRow): IconVariant {
  return {
    id: row.id,
    iconId: row.iconId,
    style: row.style,
    storagePath: row.storagePath,
    svgBody: row.svgBody,
    createdAt: row.createdAt,
  };
}

function toAdminIcon(row: IconDbRow, variants: VariantDbRow[]): AdminIcon {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    pascalName: row.pascalName,
    category: row.category,
    categorySlug: row.categorySlug,
    tags: row.tags,
    isPremium: row.isPremium,
    status: row.status,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    uploadedBy: row.uploadedBy,
    variants: variants.map(toIconVariant),
  };
}

export interface IconRepository {
  listAll(): Promise<AdminIcon[]>;
  findById(id: string): Promise<AdminIcon | null>;
  slugExists(slug: string): Promise<boolean>;
  create(data: InsertIconData): Promise<AdminIcon>;
  update(id: string, data: UpdateIconData): Promise<void>;
  setStatus(id: string, status: IconStatus, publishedAt: Date | null): Promise<void>;
  delete(id: string): Promise<void>;
  addVariant(data: InsertVariantData): Promise<IconVariant>;
  removeVariant(id: string): Promise<void>;
}

export function createIconRepository(db: IconsDbAdapter): IconRepository {
  return {
    async listAll() {
      const rows = await db.listAll();
      return Promise.all(
        rows.map(async (row) => {
          const variants = await db.listVariants(row.id);
          return toAdminIcon(row, variants);
        })
      );
    },

    async findById(id) {
      const row = await db.findById(id);
      if (!row) return null;
      const variants = await db.listVariants(id);
      return toAdminIcon(row, variants);
    },

    async slugExists(slug) {
      const row = await db.findBySlug(slug);
      return row !== null;
    },

    async create(data) {
      const row = await db.create(data);
      return toAdminIcon(row, []);
    },

    async update(id, data) {
      await db.update(id, data);
    },

    async setStatus(id, status, publishedAt) {
      await db.setStatus(id, status, publishedAt);
    },

    async delete(id) {
      await db.delete(id);
    },

    async addVariant(data) {
      const row = await db.insertVariant(data);
      return toIconVariant(row);
    },

    async removeVariant(id) {
      await db.deleteVariant(id);
    },
  };
}
