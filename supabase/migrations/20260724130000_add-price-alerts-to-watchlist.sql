-- Price alerts on watchlist entries: an optional target price + direction
-- per symbol. Additive/nullable, reuses the existing RLS policy on
-- public.watchlist (a new column needs no new policy). Written with
-- IF NOT EXISTS so it's safe to run even if columns already exist.
ALTER TABLE public.watchlist
  ADD COLUMN IF NOT EXISTS target_price numeric,
  ADD COLUMN IF NOT EXISTS direction text CHECK (direction IN ('above','below'));
