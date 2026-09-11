-- ============================================================
-- 20260911_08_add_profiles_extra_columns.sql
-- Objectif : enrichir la table profiles avec les informations
-- publiques du compte utilisateur (bio, localisation) et
-- une option de confidentialite pour le telephone.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Bénin',
  ADD COLUMN IF NOT EXISTS phone_visible boolean NOT NULL DEFAULT false;

-- Commentaire sur phone_visible pour clarifier son usage
COMMENT ON COLUMN public.profiles.phone_visible IS
  'Si true, le numero de telephone est affiche sur le profil public.';
