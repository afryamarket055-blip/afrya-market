-- ============================================================
-- 20260910_02_fix_storage_listing_images_policy.sql
-- Objectif : restreindre l'upload dans listing-images aux utilisateurs connectés
-- Avant    : policy ouverte {public} — les visiteurs anonymes pouvaient uploader
-- Après    : seuls les utilisateurs authentifiés (role authenticated)
-- ============================================================

DROP POLICY IF EXISTS "Anyone can upload listing images" ON storage.objects;

CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');
