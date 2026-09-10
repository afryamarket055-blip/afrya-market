-- ============================================================
-- 20260910_01_fix_listings_insert_policy.sql
-- Objectif : retirer la policy INSERT trop permissive sur listings
-- Avant    : "Anyone can create listings" (with_check = true)
--            permettait à un visiteur anonyme de créer une annonce
--            au nom de n'importe quel user_id.
-- Après    : seule "Un utilisateur peut créer sa propre annonce" reste
--            (with_check = auth.uid() = user_id).
-- ============================================================

DROP POLICY IF EXISTS "Anyone can create listings" ON public.listings;
