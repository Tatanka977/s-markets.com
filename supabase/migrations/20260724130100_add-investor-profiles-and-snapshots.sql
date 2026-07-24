-- These two tables are already queried by src/lib/profile.functions.ts
-- (getInvestorProfile/saveInvestorProfile/skipOnboarding and
-- upsertSnapshot/getSnapshots) but neither was present in this migrations
-- folder — they may already exist directly in the live Supabase project
-- (created out-of-band). Written defensively with IF NOT EXISTS / guarded
-- policy creation so this is safe to run whether or not that's the case.

CREATE TABLE IF NOT EXISTS public.investor_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  age_range TEXT,
  investment_goal TEXT,
  time_horizon TEXT,
  risk_tolerance TEXT,
  experience_level TEXT,
  onboarding_skipped BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.investor_profiles TO authenticated;
GRANT ALL ON public.investor_profiles TO service_role;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='investor_profiles' AND policyname='own investor profile select') THEN
    CREATE POLICY "own investor profile select" ON public.investor_profiles FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='investor_profiles' AND policyname='own investor profile insert') THEN
    CREATE POLICY "own investor profile insert" ON public.investor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='investor_profiles' AND policyname='own investor profile update') THEN
    CREATE POLICY "own investor profile update" ON public.investor_profiles FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- One row per user per day; upsert with no explicit onConflict defaults to
-- the primary key, hence the composite (user_id, snapshot_date) PK.
CREATE TABLE IF NOT EXISTS public.portfolio_snapshots (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, snapshot_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_snapshots TO authenticated;
GRANT ALL ON public.portfolio_snapshots TO service_role;
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='portfolio_snapshots' AND policyname='own snapshots') THEN
    CREATE POLICY "own snapshots" ON public.portfolio_snapshots FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS portfolio_snapshots_user_idx ON public.portfolio_snapshots(user_id, snapshot_date DESC);
