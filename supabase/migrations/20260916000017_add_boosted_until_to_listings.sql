-- ============================================================
-- 20260916_17_add_boosted_until_to_listings.sql
-- Objectif : ajouter boosted_until sur listings + triggers de sync
-- pour que les annonces boostees remontent en priorite.
-- ============================================================

-- 1. Colonne boosted_until sur listings
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS boosted_until timestamptz;

-- 2. Index pour tri rapide (les annonces boostees en premier)
CREATE INDEX IF NOT EXISTS idx_listings_boosted_until
  ON public.listings (boosted_until DESC NULLS LAST)
  WHERE boosted_until IS NOT NULL;

-- ============================================================
-- Trigger 1 (BEFORE UPDATE) : calcul de activated_at et expires_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.compute_boost_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    NEW.activated_at := COALESCE(NEW.activated_at, now());
    NEW.expires_at := COALESCE(
      NEW.expires_at,
      NEW.activated_at + (NEW.duration_days || ' days')::interval
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_boost_compute_dates ON public.boosts;
CREATE TRIGGER on_boost_compute_dates
  BEFORE UPDATE ON public.boosts
  FOR EACH ROW
  WHEN (NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active'))
  EXECUTE FUNCTION public.compute_boost_dates();

-- ============================================================
-- Trigger 2 (AFTER UPDATE) : synchronisation de listings.boosted_until
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_listing_boost()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Boost vient de devenir actif
  IF NEW.status = 'active' AND NEW.expires_at IS NOT NULL THEN
    UPDATE public.listings
    SET boosted_until = NEW.expires_at
    WHERE id = NEW.listing_id;
  END IF;

  -- Boost vient de sortir de l'etat actif (expire / annule)
  IF OLD.status = 'active' AND NEW.status != 'active' THEN
    UPDATE public.listings
    SET boosted_until = NULL
    WHERE id = NEW.listing_id;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_boost_sync_listing ON public.boosts;
CREATE TRIGGER on_boost_sync_listing
  AFTER UPDATE ON public.boosts
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_listing_boost();
