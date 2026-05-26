import { createAdminAdapter } from "@/lib/supabase/adapter";
import { createIconRepository } from "@/lib/repositories/iconRepository";
import { createStorageRepository } from "@/lib/repositories/storageRepository";
import { normalizeSvg, validateSvg } from "@/lib/svg-utils";
import type { AdminIcon, IconStyle, IconVariant } from "@/lib/domain/types";

interface Repos {
  icons: ReturnType<typeof createIconRepository>;
  storage: ReturnType<typeof createStorageRepository>;
}

function getRepos(): Repos {
  const adapter = createAdminAdapter();
  return {
    icons: createIconRepository(adapter.iconsDb),
    storage: createStorageRepository(adapter.storage),
  };
}

export async function getAdminIcons(): Promise<AdminIcon[]> {
  return getRepos().icons.listAll();
}

export async function getIconById(id: string): Promise<AdminIcon | null> {
  return getRepos().icons.findById(id);
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const exists = await getRepos().icons.slugExists(slug);
  return !exists;
}

export interface IconStats {
  published: number;
  draft: number;
  premium: number;
  categories: number;
}

export async function getIconStats(): Promise<IconStats> {
  const icons = await getRepos().icons.listAll();
  const categories = new Set(icons.map((i) => i.categorySlug));
  return {
    published: icons.filter((i) => i.status === "published").length,
    draft: icons.filter((i) => i.status === "draft").length,
    premium: icons.filter((i) => i.isPremium).length,
    categories: categories.size,
  };
}

export interface CreateDraftIconInput {
  name: string;
  slug: string;
  pascalName: string;
  category: string;
  categorySlug: string;
  tags: string[];
  isPremium: boolean;
}

export async function createDraftIcon(
  input: CreateDraftIconInput
): Promise<AdminIcon> {
  const repos = getRepos();
  return repos.icons.create({
    ...input,
    uploadedBy: process.env.ADMIN_EMAIL ?? null,
  });
}

export interface UpdateIconInput {
  name?: string;
  pascalName?: string;
  category?: string;
  categorySlug?: string;
  tags?: string[];
  isPremium?: boolean;
}

export async function updateIcon(
  id: string,
  input: UpdateIconInput
): Promise<void> {
  await getRepos().icons.update(id, input);
}

export interface AddVariantInput {
  iconId: string;
  iconSlug: string;
  style: IconStyle;
  svgContent: string;
}

export async function addVariantToIcon(
  input: AddVariantInput
): Promise<IconVariant> {
  const validation = validateSvg(input.svgContent);
  if (!validation.ok) throw new Error(validation.error);

  const normalized = normalizeSvg(input.svgContent);
  const encoder = new TextEncoder();
  const buffer = encoder.encode(normalized).buffer as ArrayBuffer;

  const repos = getRepos();
  const storagePath = await repos.storage.uploadVariant(
    input.iconSlug,
    input.style,
    buffer
  );

  return repos.icons.addVariant({
    iconId: input.iconId,
    style: input.style,
    storagePath,
    svgBody: normalized,
  });
}

export async function removeVariantFromIcon(variantId: string): Promise<void> {
  await getRepos().icons.removeVariant(variantId);
}

export async function publishIcon(id: string): Promise<void> {
  await getRepos().icons.setStatus(id, "published", new Date());
}

export async function unpublishIcon(id: string): Promise<void> {
  await getRepos().icons.setStatus(id, "draft", null);
}

export async function deleteIcon(id: string): Promise<void> {
  await getRepos().icons.delete(id);
}

export async function getCategories(): Promise<{ name: string; slug: string }[]> {
  return getRepos().icons.listCategories();
}

export async function renameCategory(
  oldSlug: string,
  newName: string,
  newSlug: string
): Promise<void> {
  await getRepos().icons.renameCategory(oldSlug, newName, newSlug);
}
