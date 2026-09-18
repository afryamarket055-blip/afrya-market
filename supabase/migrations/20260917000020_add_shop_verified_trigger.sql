-- ============================================================
-- 20260917_20_add_shop_verified_trigger.sql
-- Objectif : notifier le vendeur quand sa boutique est verifiee.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_shop_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  shop text;
begin
  IF NEW.is_verified = true AND (OLD.is_verified IS NULL OR OLD.is_verified = false) THEN
    shop := coalesce(NEW.shop_name, 'votre boutique');

    insert into public.notifications (user_id, type, content, link)
    values (
      NEW.id,
      'shop_verified',
      'Felicitations ! ' || shop || ' est maintenant verifiee par AFRYA MARKET',
      '/boutique/' || NEW.id
    );
  END IF;

  return NEW;
end;
$function$;

DROP TRIGGER IF EXISTS on_shop_verified ON public.profiles;
CREATE TRIGGER on_shop_verified
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_shop_verified();
