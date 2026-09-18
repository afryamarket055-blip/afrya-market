-- ============================================================
-- 20260918_23_add_order_notifications_triggers.sql
-- Objectif : notifier les parties a chaque etape de la commande.
-- ============================================================

-- ============================================
-- 1. Nouvelle commande creee -> notifier le vendeur
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  buyer_name text;
  listing_title text;
begin
  select full_name into buyer_name from public.profiles where id = NEW.buyer_id;
  select title into listing_title from public.listings where id = NEW.listing_id;

  insert into public.notifications (user_id, type, content, link)
  values (
    NEW.seller_id,
    'order_update',
    coalesce(buyer_name, 'Un acheteur') || ' a commande "' || coalesce(listing_title, 'votre article') || '"',
    '/commande/' || NEW.id
  );

  return NEW;
end;
$function$;

DROP TRIGGER IF EXISTS on_new_order ON public.orders;
CREATE TRIGGER on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_order();

-- ============================================
-- 2. Changement de statut -> notifier l'autre partie
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  listing_title text;
  other_user_id uuid;
  notif_content text;
  actor_name text;
begin
  IF NEW.status = OLD.status THEN
    return NEW;
  END IF;

  select title into listing_title from public.listings where id = NEW.listing_id;

  -- Determiner qui a fait l'action (via auth.uid())
  if auth.uid() = NEW.buyer_id then
    other_user_id := NEW.seller_id;
    select full_name into actor_name from public.profiles where id = NEW.buyer_id;
  elsif auth.uid() = NEW.seller_id then
    other_user_id := NEW.buyer_id;
    select full_name into actor_name from public.profiles where id = NEW.seller_id;
  else
    -- Admin ou systeme : notifier les 2
    other_user_id := NEW.buyer_id;
    actor_name := 'Systeme';
  end if;

  -- Construire le message selon le statut
  case NEW.status
    when 'accepted' then
      notif_content := 'Votre commande de "' || coalesce(listing_title, 'votre article') || '" a ete acceptee';
    when 'deal_locked' then
      notif_content := 'AFRYA DEAL signee pour "' || coalesce(listing_title, 'votre article') || '" - en attente de paiement';
    when 'paid' then
      notif_content := 'Paiement recu pour "' || coalesce(listing_title, 'votre article') || '"';
    when 'shipped' then
      notif_content := 'Votre commande "' || coalesce(listing_title, 'votre article') || '" a ete expediee';
    when 'delivered' then
      notif_content := 'L''acheteur a confirme la reception de "' || coalesce(listing_title, 'votre article') || '"';
    when 'completed' then
      notif_content := 'Commande "' || coalesce(listing_title, 'votre article') || '" terminee';
    when 'cancelled' then
      notif_content := 'Commande "' || coalesce(listing_title, 'votre article') || '" annulee par ' || coalesce(actor_name, 'l''autre partie');
    else
      notif_content := 'Mise a jour de votre commande "' || coalesce(listing_title, 'votre article') || '"';
  end case;

  insert into public.notifications (user_id, type, content, link)
  values (
    other_user_id,
    'order_update',
    notif_content,
    '/commande/' || NEW.id
  );

  return NEW;
end;
$function$;

DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_status_change();

-- ============================================
-- 3. Double notification quand le statut passe a deal_locked
--    (notifier aussi le vendeur si l'acheteur signe en dernier)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_deal_signed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  listing_title text;
  signer_name text;
  recipient_id uuid;
begin
  select title into listing_title from public.listings where id = NEW.listing_id;

  -- Acheteur vient de signer
  IF NEW.deal_signed_buyer_at IS NOT NULL
     AND (OLD.deal_signed_buyer_at IS NULL OR OLD.deal_signed_buyer_at IS DISTINCT FROM NEW.deal_signed_buyer_at)
     AND NEW.status <> 'deal_locked' THEN
    -- Notifier le vendeur
    select full_name into signer_name from public.profiles where id = NEW.buyer_id;
    insert into public.notifications (user_id, type, content, link)
    values (
      NEW.seller_id,
      'order_update',
      coalesce(signer_name, 'L''acheteur') || ' a signe l''AFRYA DEAL pour "' || coalesce(listing_title, 'votre article') || '"',
      '/commande/' || NEW.id
    );
  END IF;

  -- Vendeur vient de signer
  IF NEW.deal_signed_seller_at IS NOT NULL
     AND (OLD.deal_signed_seller_at IS NULL OR OLD.deal_signed_seller_at IS DISTINCT FROM NEW.deal_signed_seller_at)
     AND NEW.status <> 'deal_locked' THEN
    -- Notifier l'acheteur
    select full_name into signer_name from public.profiles where id = NEW.seller_id;
    insert into public.notifications (user_id, type, content, link)
    values (
      NEW.buyer_id,
      'order_update',
      coalesce(signer_name, 'Le vendeur') || ' a signe l''AFRYA DEAL pour "' || coalesce(listing_title, 'votre article') || '"',
      '/commande/' || NEW.id
    );
  END IF;

  return NEW;
end;
$function$;

DROP TRIGGER IF EXISTS on_deal_signed ON public.orders;
CREATE TRIGGER on_deal_signed
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deal_signed();
