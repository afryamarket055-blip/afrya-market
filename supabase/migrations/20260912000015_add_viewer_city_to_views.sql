-- ============================================================
-- 20260912_15_add_viewer_city_to_views.sql
-- Objectif : enregistrer automatiquement la ville du viewer
-- sur chaque vue (copie depuis profiles.city).
-- Utilise un trigger BEFORE INSERT pour eviter tout changement
-- cote client (React).
-- ============================================================

-- 1. Colonne viewer_city
ALTER TABLE public.listing_views
  ADD COLUMN IF NOT EXISTS viewer_city text;

-- 2. Fonction : copie profiles.city dans la nouvelle ligne
CREATE OR REPLACE FUNCTION public.handle_new_view()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  city text;
begin
  if new.viewer_id is not null then
    select p.city into city
    from public.profiles p
    where p.id = new.viewer_id;

    if city is not null then
      new.viewer_city := city;
    end if;
  end if;
  return new;
end;
$function$;

-- 3. Trigger BEFORE INSERT (permet de modifier new)
DROP TRIGGER IF EXISTS on_new_view ON public.listing_views;
CREATE TRIGGER on_new_view
  BEFORE INSERT ON public.listing_views
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_view();

-- 4. Index pour agregation rapide par ville
CREATE INDEX IF NOT EXISTS idx_views_viewer_city
  ON public.listing_views (listing_id, viewer_city);

-- 5. Backfill des vues existantes
UPDATE public.listing_views lv
SET viewer_city = p.city
FROM public.profiles p
WHERE lv.viewer_id = p.id
  AND lv.viewer_city IS NULL
  AND p.city IS NOT NULL;
