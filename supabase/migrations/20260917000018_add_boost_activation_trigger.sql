-- ============================================================
-- 20260917_18_add_boost_activation_trigger.sql
-- Objectif : notifier le vendeur quand son boost passe en active.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_boost_activated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  listing_title text;
begin
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    select title into listing_title from public.listings where id = NEW.listing_id;

    insert into public.notifications (user_id, type, content, link)
    values (
      NEW.user_id,
      'boost_activated',
      'Votre boost sur "' || coalesce(listing_title, 'votre annonce') || '" est actif pour ' || NEW.duration_days || ' jours',
      '/annonce/' || NEW.listing_id
    );
  END IF;

  return NEW;
end;
$function$;

DROP TRIGGER IF EXISTS on_boost_activated ON public.boosts;
CREATE TRIGGER on_boost_activated
  AFTER UPDATE ON public.boosts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_boost_activated();
