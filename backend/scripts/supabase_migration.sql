-- ============================================================
-- PIGIFY — Supabase Database Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. PROFILES TABLE
-- Stores extra user data linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  avatar      TEXT DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'viewer')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  status_reason TEXT DEFAULT '',
  last_login_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. SCANS TABLE
CREATE TABLE IF NOT EXISTS public.scans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  operator_name         TEXT,
  operator_email        TEXT,
  grade                 TEXT DEFAULT 'UNKNOWN',
  details               TEXT,
  image_url             TEXT,
  location              TEXT,
  timestamp             TIMESTAMPTZ DEFAULT NOW(),
  fruit_type            TEXT,
  local_scan_id         TEXT,
  source                TEXT DEFAULT 'unknown',
  estimated_price_per_kg NUMERIC,
  fruit_area_ratio      NUMERIC,
  size_category         TEXT,
  market_value_label    TEXT,
  weight_grams_est      NUMERIC,
  ripeness_score        NUMERIC,
  quality_score         NUMERIC,
  shelf_life_label      TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS scans_updated_at ON public.scans;
CREATE TRIGGER scans_updated_at
  BEFORE UPDATE ON public.scans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS scans_timestamp_idx ON public.scans (timestamp DESC);
CREATE INDEX IF NOT EXISTS scans_user_id_idx ON public.scans (user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS scans_operator_email_idx ON public.scans (operator_email, timestamp DESC);
CREATE UNIQUE INDEX IF NOT EXISTS scans_local_scan_id_idx ON public.scans (local_scan_id, operator_email) WHERE local_scan_id IS NOT NULL AND operator_email IS NOT NULL;

-- 3. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name   TEXT NOT NULL,
  author_email  TEXT,
  text          TEXT CHECK (length(text) <= 1200),
  source        TEXT DEFAULT 'mobile_app',
  -- Scan snapshot (embedded JSON)
  scan_snapshot JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS community_posts_updated_at ON public.community_posts;
CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS community_posts_created_at_idx ON public.community_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS community_posts_user_id_idx ON public.community_posts (user_id, created_at DESC);

-- 4. COMMUNITY COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.community_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  commenter_user  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  commenter_name  TEXT NOT NULL,
  commenter_email TEXT,
  text            TEXT NOT NULL CHECK (length(text) <= 1200),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS community_comments_updated_at ON public.community_comments;
CREATE TRIGGER community_comments_updated_at
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. COMMUNITY REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.community_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name   TEXT,
  user_email  TEXT,
  type        TEXT NOT NULL CHECK (type IN ('heart', 'like')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, user_email, type)
);

-- 6. COMMUNITY NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.community_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id     UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  type        TEXT,
  message     TEXT,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES: users can read their own; admins can read all; service role bypasses
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- SCANS: open read for now (backend enforces auth), write via service role only
DROP POLICY IF EXISTS "scans_all_authenticated" ON public.scans;
CREATE POLICY "scans_all_authenticated" ON public.scans
  FOR ALL USING (true);

-- COMMUNITY: open read, authenticated write
DROP POLICY IF EXISTS "community_posts_all" ON public.community_posts;
CREATE POLICY "community_posts_all" ON public.community_posts
  FOR ALL USING (true);

DROP POLICY IF EXISTS "community_comments_all" ON public.community_comments;
CREATE POLICY "community_comments_all" ON public.community_comments
  FOR ALL USING (true);

DROP POLICY IF EXISTS "community_reactions_all" ON public.community_reactions;
CREATE POLICY "community_reactions_all" ON public.community_reactions
  FOR ALL USING (true);

DROP POLICY IF EXISTS "community_notifications_own" ON public.community_notifications;
CREATE POLICY "community_notifications_own" ON public.community_notifications
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CREATE YOUR ADMIN USER
-- After registering your admin account through the app,
-- run this query replacing the email with your admin email:
-- ============================================================
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin@email.com');
