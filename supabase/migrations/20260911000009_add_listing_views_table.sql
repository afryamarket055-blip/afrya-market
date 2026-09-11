-- ============================================================
-- 20260911_09_add_listing_views_table.sql
-- Objectif : compter les vues des annonces avec anti-spam
-- (max 1 vue par utilisateur par annonce par jour).
-- ============================================================

CREATE TABLE public.listing_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id text NOT NULL,
  viewer_id uuid,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  -- Colonne generee : jour (UTC) calcule a l'insertion
  viewed_day date GENERATED ALWAYS AS ((viewed_at AT TIME ZONE 'UTC')::date) STORED,
  CONSTRAINT fk_views_listing_id
    FOREIGN KEY (listing_id) REFERENCES public.listings(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_views_viewer_id
    FOREIGN KEY (viewer_id) REFERENCES public.profiles(id)
    ON DELETE SET NULL
);

-- Anti-spam : 1 vue par user par jour par annonce
CREATE UNIQUE INDEX uniq_view_user_listing_day
  ON public.listing_views (listing_id, viewer_id, viewed_day)
  WHERE viewer_id IS NOT NULL;

-- Index pour requetes rapides
CREATE INDEX idx_views_listing_id
  ON public.listing_views (listing_id);

CREATE INDEX idx_views_listing_date
  ON public.listing_views (listing_id, viewed_at DESC);

CREATE INDEX idx_views_viewer_id
  ON public.listing_views (viewer_id);

-- RLS
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les vues sont visibles par tous"
  ON public.listing_views FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Tout le monde peut enregistrer une vue"
  ON public.listing_views FOR INSERT
  TO public
  WITH CHECK (
    viewer_id IS NULL
    OR auth.uid() = viewer_id
  );
