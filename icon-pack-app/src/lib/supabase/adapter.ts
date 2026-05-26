/**
 * Supabase adapter — the ONLY file in this codebase that imports from
 * @supabase/supabase-js directly.
 *
 * Admin operations use the service role key (bypasses RLS).
 * To swap the backend, re-implement the exported interfaces here.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { IconStatus, IconStyle } from "@/lib/domain/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbClient = SupabaseClient<any>;

// ── Internal DB row shapes ────────────────────────────────────────────────────

interface DbIconRow {
  id: string;
  name: string;
  slug: string;
  pascal_name: string;
  category: string;
  category_slug: string;
  tags: string[];
  is_premium: boolean;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
}

interface DbVariantRow {
  id: string;
  icon_id: string;
  style: string;
  storage_path: string;
  svg_body: string;
  created_at: string;
}

interface DbIconWithVariants extends DbIconRow {
  icon_variants: DbVariantRow[];
}

// ── Public adapter row types ──────────────────────────────────────────────────

export interface IconDbRow {
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
}

export interface VariantDbRow {
  id: string;
  iconId: string;
  style: IconStyle;
  storagePath: string;
  svgBody: string;
  createdAt: Date;
}

export interface InsertIconData {
  name: string;
  slug: string;
  pascalName: string;
  category: string;
  categorySlug: string;
  tags: string[];
  isPremium: boolean;
  uploadedBy: string | null;
}

export interface InsertVariantData {
  iconId: string;
  style: IconStyle;
  storagePath: string;
  svgBody: string;
}

export interface UpdateIconData {
  name?: string;
  pascalName?: string;
  category?: string;
  categorySlug?: string;
  tags?: string[];
  isPremium?: boolean;
}

// ── Adapter interfaces ────────────────────────────────────────────────────────

export interface IconWithVariants {
  icon: IconDbRow;
  variants: VariantDbRow[];
}

export interface IconsDbAdapter {
  listAll(): Promise<IconWithVariants[]>;
  findById(id: string): Promise<IconWithVariants | null>;
  findBySlug(slug: string): Promise<IconDbRow | null>;
  create(data: InsertIconData): Promise<IconDbRow>;
  update(id: string, data: UpdateIconData): Promise<void>;
  setStatus(
    id: string,
    status: "draft" | "published",
    publishedAt: Date | null
  ): Promise<void>;
  delete(id: string): Promise<void>;
  listVariants(iconId: string): Promise<VariantDbRow[]>;
  insertVariant(data: InsertVariantData): Promise<VariantDbRow>;
  deleteVariant(id: string): Promise<void>;
  renameCategory(oldSlug: string, newName: string, newSlug: string): Promise<void>;
}

export interface StorageAdapter {
  upload(
    bucket: string,
    path: string,
    data: ArrayBuffer,
    contentType: string
  ): Promise<void>;
  remove(bucket: string, paths: string[]): Promise<void>;
  getPublicUrl(bucket: string, path: string): string;
}

export interface AdminAdapter {
  iconsDb: IconsDbAdapter;
  storage: StorageAdapter;
}

// ── Row mappers ───────────────────────────────────────────────────────────────

function mapIconRow(row: DbIconRow): IconDbRow {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    pascalName: row.pascal_name,
    category: row.category,
    categorySlug: row.category_slug,
    tags: row.tags,
    isPremium: row.is_premium,
    status: row.status as IconStatus,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    uploadedBy: row.uploaded_by,
  };
}

function mapVariantRow(row: DbVariantRow): VariantDbRow {
  return {
    id: row.id,
    iconId: row.icon_id,
    style: row.style as IconStyle,
    storagePath: row.storage_path,
    svgBody: row.svg_body,
    createdAt: new Date(row.created_at),
  };
}

// ── Adapter builders ──────────────────────────────────────────────────────────


function buildIconsDbAdapter(client: DbClient): IconsDbAdapter {
  return {
    async listAll() {
      const { data, error } = await client
        .from("icons")
        .select("*, icon_variants(*)")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data as DbIconWithVariants[]).map((row) => ({
        icon: mapIconRow(row),
        variants: (row.icon_variants ?? []).map(mapVariantRow),
      }));
    },

    async findById(id) {
      const { data, error } = await client
        .from("icons")
        .select("*, icon_variants(*)")
        .eq("id", id)
        .single<DbIconWithVariants>();
      if (error) return null;
      return {
        icon: mapIconRow(data),
        variants: (data.icon_variants ?? []).map(mapVariantRow),
      };
    },

    async findBySlug(slug) {
      const { data, error } = await client
        .from("icons")
        .select("*")
        .eq("slug", slug)
        .single<DbIconRow>();
      if (error) return null;
      return mapIconRow(data);
    },

    async create(data) {
      const { data: row, error } = await client
        .from("icons")
        .insert({
          name: data.name,
          slug: data.slug,
          pascal_name: data.pascalName,
          category: data.category,
          category_slug: data.categorySlug,
          tags: data.tags,
          is_premium: data.isPremium,
          uploaded_by: data.uploadedBy,
        })
        .select()
        .single<DbIconRow>();
      if (error) throw new Error(error.message);
      return mapIconRow(row);
    },

    async update(id, data) {
      const patch: Record<string, unknown> = {};
      if (data.name !== undefined) patch.name = data.name;
      if (data.pascalName !== undefined) patch.pascal_name = data.pascalName;
      if (data.category !== undefined) patch.category = data.category;
      if (data.categorySlug !== undefined) patch.category_slug = data.categorySlug;
      if (data.tags !== undefined) patch.tags = data.tags;
      if (data.isPremium !== undefined) patch.is_premium = data.isPremium;
      const { error } = await client.from("icons").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    },

    async setStatus(id, status, publishedAt) {
      const { error } = await client
        .from("icons")
        .update({
          status,
          published_at: publishedAt ? publishedAt.toISOString() : null,
        })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },

    async delete(id) {
      const { error } = await client.from("icons").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },

    async listVariants(iconId) {
      const { data, error } = await client
        .from("icon_variants")
        .select("*")
        .eq("icon_id", iconId);
      if (error) throw new Error(error.message);
      return (data as DbVariantRow[]).map(mapVariantRow);
    },

    async insertVariant(data) {
      const { data: row, error } = await client
        .from("icon_variants")
        .insert({
          icon_id: data.iconId,
          style: data.style,
          storage_path: data.storagePath,
          svg_body: data.svgBody,
        })
        .select()
        .single<DbVariantRow>();
      if (error) throw new Error(error.message);
      return mapVariantRow(row);
    },

    async deleteVariant(id) {
      const { error } = await client
        .from("icon_variants")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },

    async renameCategory(oldSlug, newName, newSlug) {
      const { error } = await client
        .from("icons")
        .update({ category: newName, category_slug: newSlug })
        .eq("category_slug", oldSlug);
      if (error) throw new Error(error.message);
    },
  };
}

function buildStorageAdapter(client: DbClient): StorageAdapter {
  return {
    async upload(bucket, path, data, contentType) {
      const { error } = await client.storage
        .from(bucket)
        .upload(path, data, { contentType, upsert: true });
      if (error) throw new Error(error.message);
    },

    async remove(bucket, paths) {
      const { error } = await client.storage.from(bucket).remove(paths);
      if (error) throw new Error(error.message);
    },

    getPublicUrl(bucket, path) {
      const { data } = client.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    },
  };
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates an admin adapter using the Supabase service role key.
 * Only use in Server Actions and Route Handlers — never in Client Components.
 */
export function createAdminAdapter(): AdminAdapter {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  return {
    iconsDb: buildIconsDbAdapter(client),
    storage: buildStorageAdapter(client),
  };
}

// ── Public adapter (anon key, respects RLS) ───────────────────────────────────

export interface PublishedIconRecord {
  slug: string;
  name: string;
  pascalName: string;
  category: string;
  categorySlug: string;
  isPremium: boolean;
  variants: Array<{ style: IconStyle; svgBody: string }>;
}

export interface PublicIconsAdapter {
  listPublished(): Promise<PublishedIconRecord[]>;
}

function buildPublicIconsAdapter(client: DbClient): PublicIconsAdapter {
  return {
    async listPublished() {
      const { data, error } = await client
        .from("icons")
        .select("slug, name, pascal_name, category, category_slug, is_premium, icon_variants(style, svg_body)")
        .eq("status", "published")
        .order("name");
      if (error) throw new Error(error.message);

      return (data ?? []).map((row: Record<string, unknown>) => ({
        slug: row.slug as string,
        name: row.name as string,
        pascalName: row.pascal_name as string,
        category: row.category as string,
        categorySlug: row.category_slug as string,
        isPremium: row.is_premium as boolean,
        variants: ((row.icon_variants as Array<{ style: string; svg_body: string }>) ?? []).map(
          (v) => ({ style: v.style as IconStyle, svgBody: v.svg_body })
        ),
      }));
    },
  };
}

/** Use in Server Components for reading public data. Uses anon key (RLS applies). */
export function createPublicAdapter(): { icons: PublicIconsAdapter } {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  return { icons: buildPublicIconsAdapter(client) };
}
