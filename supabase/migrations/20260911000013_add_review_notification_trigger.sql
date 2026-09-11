-- ============================================================
-- 20260911_13_add_review_notification_trigger.sql
-- Objectif : notifier un utilisateur quand il recoit un avis.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  reviewer_name text;
  stars_text text;
begin
  select full_name into reviewer_name
  from public.profiles
  where id = new.reviewer_id;

  stars_text := repeat('★', new.rating);

  insert into public.notifications (user_id, type, content, link)
  values (
    new.reviewee_id,
    'review',
    coalesce(reviewer_name, 'Quelqu''un') || ' vous a laisse un avis ' || stars_text,
    '/vendeur/' || new.reviewee_id
  );

  return new;
end;
$function$;

DROP TRIGGER IF EXISTS on_new_review ON public.reviews;
CREATE TRIGGER on_new_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_review();
