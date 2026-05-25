-- Run in Supabase → SQL Editor
-- Phase 1: Admin schema foundation

-- ── 1. Add role to profiles ───────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- Replace the existing UPDATE policy to also lock the role column,
-- preventing users from self-promoting to admin.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan = (SELECT plan FROM public.profiles WHERE id = auth.uid())
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- To grant admin access, run manually in SQL Editor:
--   UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';


-- ── 2. icons table ────────────────────────────────────────────────────────

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
  uploaded_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_icons_status        ON public.icons (status);
CREATE INDEX IF NOT EXISTS idx_icons_category_slug ON public.icons (category_slug);
CREATE INDEX IF NOT EXISTS idx_icons_slug          ON public.icons (slug);

-- ── 3. icon_variants table ────────────────────────────────────────────────

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

-- ── 4. updated_at trigger for icons ──────────────────────────────────────

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

-- ── 5. Row Level Security ─────────────────────────────────────────────────

ALTER TABLE public.icons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icon_variants ENABLE ROW LEVEL SECURITY;

-- Helper: is the calling user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- icons: public sees published rows; admin sees everything
CREATE POLICY "icons_select"
  ON public.icons FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "icons_insert"
  ON public.icons FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "icons_update"
  ON public.icons FOR UPDATE
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "icons_delete"
  ON public.icons FOR DELETE
  USING (public.is_admin());

-- icon_variants: public sees variants of published icons; admin sees all
CREATE POLICY "variants_select"
  ON public.icon_variants FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.icons
      WHERE icons.id = icon_variants.icon_id
        AND icons.status = 'published'
    )
  );

CREATE POLICY "variants_insert"
  ON public.icon_variants FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "variants_update"
  ON public.icon_variants FOR UPDATE
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "variants_delete"
  ON public.icon_variants FOR DELETE
  USING (public.is_admin());
