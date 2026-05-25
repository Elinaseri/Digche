-- Phase 2: Storage bucket for icon SVG assets
-- Admin uploads use the service role key (bypasses storage RLS).
-- Files in this bucket are publicly readable by URL.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'icon-assets',
  'icon-assets',
  true,
  102400,
  ARRAY['image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;
