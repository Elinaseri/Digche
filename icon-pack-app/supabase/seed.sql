-- Run this in your Supabase project → SQL Editor

-- 1. Profiles table (Model A: plan column)
CREATE TABLE public.profiles (
  id              uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name    text,
  avatar_url      text,
  email           text,
  plan            text        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  plan_expires_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users may update their own display_name / avatar_url but never plan
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan = (SELECT plan FROM public.profiles WHERE id = auth.uid())
  );

-- 3. Auto-create profile row on first sign-in
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.email
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Premium plan is set automatically by the billing webhook (future phase).
--    Do not set plan manually — it will be overwritten on next purchase event.
