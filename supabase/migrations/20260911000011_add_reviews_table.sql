-- ============================================================
-- 20260911_11_add_reviews_table.sql
-- Objectif : systeme d'avis entre utilisateurs (vendeurs notes
-- par les acheteurs). 1 avis par paire, modifiable, supprimable.
-- ============================================================

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL,
  reviewee_id uuid NOT NULL,
  listing_id text,
  rating smallint NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_reviews_reviewer_id
    FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_reviewee_id
    FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_listing_id
    FOREIGN KEY (listing_id) REFERENCES public.listings(id)
    ON DELETE SET NULL,
  CONSTRAINT chk_reviews_rating
    CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT chk_reviews_not_self
    CHECK (reviewer_id <> reviewee_id),
  CONSTRAINT uniq_reviews_pair
    UNIQUE (reviewer_id, reviewee_id)
);

-- Index
CREATE INDEX idx_reviews_reviewee
  ON public.reviews (reviewee_id, created_at DESC);

CREATE INDEX idx_reviews_reviewer
  ON public.reviews (reviewer_id);

CREATE INDEX idx_reviews_listing
  ON public.reviews (listing_id);

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les avis sont visibles par tous"
  ON public.reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Un utilisateur peut creer son propre avis"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Un utilisateur peut modifier son propre avis"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Un utilisateur peut supprimer son propre avis"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = reviewer_id);
