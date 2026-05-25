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

export async function publishIcon(id: string): Promise<void> {
  await getRepos().icons.setStatus(id, "published", new Date());
}

export async function unpublishIcon(id: string): Promise<void> {
  await getRepos().icons.setStatus(id, "draft", null);
}

export async function deleteIcon(id: string): Promise<void> {
  await getRepos().icons.delete(id);
}
