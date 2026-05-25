-- Phase 1 & 2: Admin schema
-- Admin auth uses env-var credentials + cookie session (no Supabase auth for admin).
-- Admin DB operations use the service role key (bypasses RLS).

-- ── icons table ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.icons (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  slug          text        NOT NULL UNIQUE,
  pascal_name   text        NOT NULL,
  category      text        NOT NULL,
  category_slug text        NOT NULL,
  tags          text[]      NOT NULL DEFAULT '{}',
  is_premium    boolean     NOT NULL DEFAULT false,
  status        text        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'published')),
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  uploaded_by   text        -- admin email, for audit trail
);

CREATE INDEX IF NOT EXISTS idx_icons_status        ON public.icons (status);
CREATE INDEX IF NOT EXISTS idx_icons_category_slug ON public.icons (category_slug);
CREATE INDEX IF NOT EXISTS idx_icons_slug          ON public.icons (slug);

-- ── icon_variants table ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.icon_variants (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_id      uuid        NOT NULL REFERENCES public.icons(id) ON DELETE CASCADE,
  style        text        NOT NULL CHECK (style IN ('Bold','Bulk','Linear','Outline')),
  storage_path text        NOT NULL,
  svg_body     text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (icon_id, style)
);

CREATE INDEX IF NOT EXISTS idx_icon_variants_icon_id ON public.icon_variants (icon_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS icons_updated_at ON public.icons;
CREATE TRIGGER icons_updated_at
  BEFORE UPDATE ON public.icons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Admin writes use the service role key which bypasses RLS entirely.
-- Only public read policy is needed here.

ALTER TABLE public.icons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icon_variants ENABLE ROW LEVEL SECURITY;

-- Public users see only published icons
CREATE POLICY "icons_public_select"
  ON public.icons FOR SELECT
  USING (status = 'published');

-- Public users see only variants of published icons
CREATE POLICY "variants_public_select"
  ON public.icon_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.icons
      WHERE icons.id = icon_variants.icon_id
        AND icons.status = 'published'
    )
  );
