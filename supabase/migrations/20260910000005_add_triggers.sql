-- ============================================================
-- 20260910_05_add_triggers.sql
-- Objectif : documenter les 3 fonctions + 2 triggers existants en base
-- Ces éléments ont été créés directement dans le dashboard Supabase
-- et ne figuraient dans aucune migration avant ce fichier.
-- ============================================================

-- ------------------------------------------------------------
-- FONCTION 1 : handle_new_user
-- Crée automatiquement un profil quand un user s'inscrit.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$function$;

-- Trigger associé sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- FONCTION 2 : handle_new_message
-- Crée une notification au destinataire quand un message est envoyé.
-- SECURITY DEFINER : nécessaire car aucune policy INSERT n'existe
-- sur public.notifications — seul ce trigger peut y insérer.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  conv record;
  recipient_id uuid;
  sender_name text;
begin
  select * into conv from public.conversations where id = new.conversation_id;

  if conv.buyer_id = new.sender_id then
    recipient_id := conv.seller_id;
  else
    recipient_id := conv.buyer_id;
  end if;

  select full_name into sender_name from public.profiles where id = new.sender_id;

  insert into public.notifications (user_id, type, content, link)
  values (
    recipient_id,
    'message',
    coalesce(sender_name, 'Quelqu''un') || ' vous a envoyé un message',
    '/conversation/' || new.conversation_id
  );

  return new;
end;
$function$;

-- Trigger associé sur public.messages
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- ------------------------------------------------------------
-- FONCTION 3 : rls_auto_enable
-- Event trigger qui active RLS automatiquement sur toute
-- nouvelle table créée dans le schéma public.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

-- Event trigger associé
DROP EVENT TRIGGER IF EXISTS rls_auto_enable_trigger;
CREATE EVENT TRIGGER rls_auto_enable_trigger
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION public.rls_auto_enable();
