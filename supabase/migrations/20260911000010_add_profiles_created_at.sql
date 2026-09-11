-- ============================================================
-- 20260911_10_add_profiles_created_at.sql
-- Objectif : ajouter created_at sur profiles (date d'inscription)
-- pour l'afficher dans les profils publics.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Mettre a jour les profils existants avec la date de creation de leur compte auth
UPDATE public.profiles p
SET created_at = u.created_at
FROM auth.users u
WHERE p.id = u.id
  AND p.created_at > u.created_at;
