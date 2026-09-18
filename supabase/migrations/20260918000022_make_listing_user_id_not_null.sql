-- ============================================================
-- 20260918_22_make_listing_user_id_not_null.sql
-- Objectif : empecher la creation d'annonces sans proprietaire.
-- Bug detecte : certaines annonces avaient user_id = null, ce qui
-- cassait le systeme de commandes (RLS ne pouvait pas valider).
-- ============================================================

DELETE FROM public.listings WHERE user_id IS NULL;

ALTER TABLE public.listings
  ALTER COLUMN user_id SET NOT NULL;
