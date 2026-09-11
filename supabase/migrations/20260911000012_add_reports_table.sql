-- ============================================================
-- 20260911_12_add_reports_table.sql
-- Objectif : permettre aux utilisateurs connectes de signaler
-- une annonce ou un profil. Moderation manuelle (Phase 6).
-- ============================================================

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_reports_reporter_id
    FOREIGN KEY (reporter_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_reports_target_type
    CHECK (target_type IN ('listing', 'profile')),
  CONSTRAINT chk_reports_status
    CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  CONSTRAINT chk_reports_reason_min
    CHECK (char_length(reason) >= 3)
);

CREATE INDEX idx_reports_reporter
  ON public.reports (reporter_id);

CREATE INDEX idx_reports_target
  ON public.reports (target_type, target_id);

CREATE INDEX idx_reports_status
  ON public.reports (status, created_at DESC);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Chacun voit uniquement ses propres signalements
CREATE POLICY "Un utilisateur voit ses propres signalements"
  ON public.reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Un utilisateur peut creer un signalement"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Pas de UPDATE ni DELETE (signalements definitifs)
