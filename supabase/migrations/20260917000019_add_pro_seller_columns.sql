-- ============================================================
-- 20260917_19_add_pro_seller_columns.sql
-- Objectif : permettre aux vendeurs de devenir professionnels
-- avec une boutique personnalisee (nom, description, logo, banniere).
-- is_verified est reserve a l'admin (trigger anti-auto-verification).
-- ============================================================

-- 1. Colonnes boutique pro sur profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_pro boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shop_name text,
  ADD COLUMN IF NOT EXISTS shop_description text,
  ADD COLUMN IF NOT EXISTS shop_logo text,
  ADD COLUMN IF NOT EXISTS shop_banner text,
  ADD COLUMN IF NOT EXISTS shop_category text,
  ADD COLUMN IF NOT EXISTS pro_since timestamptz;

-- 2. Contraintes de validation
ALTER TABLE public.profiles
  ADD CONSTRAINT chk_shop_description_length
    CHECK (shop_description IS NULL OR char_length(shop_description) <= 500),
  ADD CONSTRAINT chk_shop_name_length
    CHECK (shop_name IS NULL OR char_length(shop_name) BETWEEN 2 AND 60);

-- 3. Trigger anti-triche : seul un admin peut changer is_verified
CREATE OR REPLACE FUNCTION public.prevent_is_verified_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.is_verified IS DISTINCT FROM NEW.is_verified THEN
    -- Autoriser si aucun contexte auth (execution SQL Editor)
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;
    -- Sinon, autoriser uniquement si l'utilisateur est admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    ) THEN
      RAISE EXCEPTION 'Modification de is_verified interdite';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_is_verified_change_trigger ON public.profiles;
CREATE TRIGGER prevent_is_verified_change_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_is_verified_change();

-- 4. Index pour filtrer les boutiques pro (page decouverte future)
CREATE INDEX IF NOT EXISTS idx_profiles_pro_verified
  ON public.profiles (is_pro, is_verified)
  WHERE is_pro = true;
