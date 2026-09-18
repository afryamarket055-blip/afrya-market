-- ============================================================
-- 20260918_24_secure_profiles_with_public_view.sql
-- Objectif : arreter la fuite de donnees privees (phone, is_admin)
-- via l'API REST publique. On cree une vue profiles_public qui
-- expose uniquement les champs publics, et on durcit RLS sur profiles.
-- ============================================================

-- 1. Vue profiles_public (expose uniquement les champs publics)
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  city,
  country,
  created_at,
  is_pro,
  is_verified,
  shop_name,
  shop_description,
  shop_logo,
  shop_banner,
  shop_category,
  pro_since,
  CASE
    WHEN phone_visible = true THEN phone
    ELSE NULL
  END AS phone
FROM public.profiles;

-- 2. Donner les privileges SELECT a tous
GRANT SELECT ON public.profiles_public TO anon, authenticated, service_role;

-- 3. Durcir la policy SELECT sur profiles
DROP POLICY IF EXISTS "Les profils sont visibles par tous" ON public.profiles;

CREATE POLICY "Un utilisateur voit son propre profil ou admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
