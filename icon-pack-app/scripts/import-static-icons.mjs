/**
 * Import the 137 static icons (src/data/manifest.json + icons.json) into the
 * Supabase admin panel database and storage bucket.
 *
 * Usage:
 *   node scripts/import-static-icons.mjs
 *
 * Reads credentials from .env.local. Safe to run multiple times (upsert).
 */

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Load .env.local ───────────────────────────────────────────────────────────

async function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  const raw = await fs.readFile(envPath, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    env[key] = val;
  }
  return env;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, label, retries = 3, delayMs = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const result = await fn();
    if (!result.error) return result;
    if (attempt < retries) {
      await sleep(delayMs * attempt);
    } else {
      return result;
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const env = await loadEnv();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── Read static data ────────────────────────────────────────────────────────
  const manifest = JSON.parse(
    await fs.readFile(path.join(ROOT, "src/data/manifest.json"), "utf8")
  );
  const bodies = JSON.parse(
    await fs.readFile(path.join(ROOT, "src/data/icons.json"), "utf8")
  );

  const icons = manifest.icons; // IconMeta[]
  console.log(`\nImporting ${icons.length} icons into Supabase…\n`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const meta of icons) {
    // ── Upsert icon row ───────────────────────────────────────────────────────
    const { data: iconRow, error: iconErr } = await withRetry(
      () =>
        supabase
          .from("icons")
          .upsert(
            {
              name: meta.name,
              slug: meta.slug,
              pascal_name: meta.pascalName,
              category: meta.category,
              category_slug: meta.categorySlug,
              tags: meta.tags ?? [],
              is_premium: meta.isPremium ?? false,
              status: "published",
              published_at: new Date().toISOString(),
              uploaded_by: "import-script",
            },
            { onConflict: "slug" }
          )
          .select("id, slug")
          .single(),
      meta.slug
    );

    if (iconErr || !iconRow) {
      console.error(`  ✗ ${meta.slug}: ${iconErr?.message ?? "no row returned"}`);
      errors++;
      continue;
    }

    const iconId = iconRow.id;
    const styles = meta.availableStyles ?? [];
    let variantErrors = 0;

    for (const style of styles) {
      const svgBody = bodies[meta.slug]?.[style];
      if (!svgBody) {
        console.warn(`  ⚠ ${meta.slug}/${style}: no SVG body, skipping variant`);
        continue;
      }

      const storagePath = `icons/${meta.slug}/${style}.svg`;

      // Upload SVG to storage (upsert = overwrite if exists)
      const { error: uploadErr } = await withRetry(
        () =>
          supabase.storage.from("icon-assets").upload(storagePath, svgBody, {
            contentType: "image/svg+xml",
            upsert: true,
          }),
        `${meta.slug}/${style} upload`
      );

      if (uploadErr) {
        console.error(`  ✗ ${meta.slug}/${style} upload: ${uploadErr.message}`);
        variantErrors++;
        continue;
      }

      // Upsert variant row
      const { error: variantErr } = await withRetry(
        () =>
          supabase
            .from("icon_variants")
            .upsert(
              {
                icon_id: iconId,
                style,
                storage_path: storagePath,
                svg_body: svgBody,
              },
              { onConflict: "icon_id,style" }
            ),
        `${meta.slug}/${style} row`
      );

      if (variantErr) {
        console.error(`  ✗ ${meta.slug}/${style} variant row: ${variantErr.message}`);
        variantErrors++;
      }
    }

    if (variantErrors === 0) {
      console.log(`  ✓ ${meta.slug}  (${styles.join(", ")})`);
      inserted++;
    } else {
      console.log(`  ~ ${meta.slug}  (${variantErrors} variant error(s))`);
      updated++;
    }
  }

  console.log(`
─────────────────────────────────────
Done.
  ✓ ${inserted} icons imported successfully
  ~ ${updated} icons with partial errors
  ✗ ${errors} icons failed entirely
─────────────────────────────────────
`);

  if (errors > 0 || updated > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
