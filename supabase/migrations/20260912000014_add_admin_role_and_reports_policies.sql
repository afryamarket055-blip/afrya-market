-- ============================================================
-- 20260912_14_add_admin_role_and_reports_policies.sql
-- Objectif : ajouter un role admin (colonne is_admin sur profiles)
-- avec protection anti-auto-promotion, et etendre les RLS sur
-- reports pour que les admins puissent modérer.
-- ============================================================

-- 1. Colonne is_admin sur profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Trigger : empecher un utilisateur non-admin de modifier is_admin
CREATE OR REPLACE FUNCTION public.prevent_is_admin_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    -- Autoriser si aucun contexte auth (execution SQL Editor)
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;
    -- Sinon, autoriser uniquement si l'utilisateur est deja admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    ) THEN
      RAISE EXCEPTION 'Modification de is_admin interdite';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_is_admin_change_trigger ON public.profiles;
CREATE TRIGGER prevent_is_admin_change_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_is_admin_change();

-- 3. RLS reports : remplacer la policy SELECT pour inclure les admins
DROP POLICY IF EXISTS "Un utilisateur voit ses propres signalements" ON public.reports;

CREATE POLICY "Visible par reporter ou admin"
  ON public.reports FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 4. RLS reports : UPDATE reserve aux admins (changement de statut)
DROP POLICY IF EXISTS "Admin peut modifier le statut" ON public.reports;

CREATE POLICY "Admin peut modifier le statut"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
