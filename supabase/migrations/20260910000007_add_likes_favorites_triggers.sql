-- ============================================================
-- 20260910_07_add_likes_favorites_triggers.sql
-- Objectif : notifier le vendeur quand son annonce recoit
-- un like ou est mise en favori.
-- ============================================================

-- ------------------------------------------------------------
-- FONCTION 1 : handle_new_like
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  seller_id uuid;
  liker_name text;
  listing_title text;
begin
  select user_id, title into seller_id, listing_title
  from public.listings
  where id = new.listing_id;

  if seller_id is null or seller_id = new.user_id then
    return new;
  end if;

  select full_name into liker_name
  from public.profiles
  where id = new.user_id;

  insert into public.notifications (user_id, type, content, link)
  values (
    seller_id,
    'like',
    coalesce(liker_name, 'Quelqu''un') || ' a aimé votre annonce "' || coalesce(listing_title, '') || '"',
    '/annonce/' || new.listing_id
  );

  return new;
end;
$function$;

DROP TRIGGER IF EXISTS on_new_like ON public.listing_likes;
CREATE TRIGGER on_new_like
  AFTER INSERT ON public.listing_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();

-- ------------------------------------------------------------
-- FONCTION 2 : handle_new_favorite
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_favorite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  seller_id uuid;
  favoriter_name text;
  listing_title text;
begin
  select user_id, title into seller_id, listing_title
  from public.listings
  where id = new.listing_id;

  if seller_id is null or seller_id = new.user_id then
    return new;
  end if;

  select full_name into favoriter_name
  from public.profiles
  where id = new.user_id;

  insert into public.notifications (user_id, type, content, link)
  values (
    seller_id,
    'favorite',
    coalesce(favoriter_name, 'Quelqu''un') || ' a enregistré votre annonce "' || coalesce(listing_title, '') || '"',
    '/annonce/' || new.listing_id
  );

  return new;
end;
$function$;

DROP TRIGGER IF EXISTS on_new_favorite ON public.listing_favorites;
CREATE TRIGGER on_new_favorite
  AFTER INSERT ON public.listing_favorites
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_favorite();
