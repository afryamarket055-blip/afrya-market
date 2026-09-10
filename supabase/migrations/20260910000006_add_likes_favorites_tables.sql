-- ============================================================
-- 20260910_06_add_likes_favorites_tables.sql
-- Objectif : créer les tables listing_likes et listing_favorites
-- avec FK, index et RLS pour Likes/Favoris
-- ============================================================

-- ------------------------------------------------------------
-- TABLE 1 : listing_likes
-- ------------------------------------------------------------
CREATE TABLE public.listing_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  listing_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uniq_like_user_listing UNIQUE (user_id, listing_id),
  CONSTRAINT fk_likes_user_id
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_likes_listing_id
    FOREIGN KEY (listing_id) REFERENCES public.listings(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_likes_listing_id ON public.listing_likes (listing_id);
CREATE INDEX idx_likes_user_id ON public.listing_likes (user_id);

-- ------------------------------------------------------------
-- TABLE 2 : listing_favorites
-- ------------------------------------------------------------
CREATE TABLE public.listing_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  listing_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uniq_favorite_user_listing UNIQUE (user_id, listing_id),
  CONSTRAINT fk_favorites_user_id
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_favorites_listing_id
    FOREIGN KEY (listing_id) REFERENCES public.listings(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_favorites_listing_id ON public.listing_favorites (listing_id);
CREATE INDEX idx_favorites_user_id ON public.listing_favorites (user_id);

-- ------------------------------------------------------------
-- RLS : listing_likes
-- ------------------------------------------------------------
ALTER TABLE public.listing_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les likes sont visibles par tous"
  ON public.listing_likes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Un utilisateur peut creer ses propres likes"
  ON public.listing_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Un utilisateur peut retirer ses propres likes"
  ON public.listing_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- RLS : listing_favorites
-- ------------------------------------------------------------
ALTER TABLE public.listing_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Un utilisateur voit ses propres favoris"
  ON public.listing_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Un utilisateur peut creer ses propres favoris"
  ON public.listing_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Un utilisateur peut retirer ses propres favoris"
  ON public.listing_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
