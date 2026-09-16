-- ============================================================
-- 20260912_16_add_boosts_table.sql
-- Objectif : gerer les boosts payants des annonces.
-- 3 packs : starter (500/7j), standard (1000/30j), premium (2500/90j)
-- Paiement via Sebpay/PayDunya (webhook mettra a jour le status).
-- Anti-doublon : 1 seul boost pending/active par annonce.
-- ============================================================

CREATE TABLE public.boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id text NOT NULL,
  user_id uuid NOT NULL,
  pack text NOT NULL,
  amount numeric NOT NULL,
  duration_days integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_provider text NOT NULL DEFAULT 'sebpay',
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  expires_at timestamptz,
  CONSTRAINT fk_boosts_listing_id
    FOREIGN KEY (listing_id) REFERENCES public.listings(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_boosts_user_id
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_boosts_pack
    CHECK (pack IN ('starter', 'standard', 'premium')),
  CONSTRAINT chk_boosts_status
    CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  CONSTRAINT chk_boosts_amount_positive
    CHECK (amount > 0),
  CONSTRAINT chk_boosts_duration_positive
    CHECK (duration_days > 0)
);

-- Anti-doublon : 1 seul boost pending ou active par annonce
CREATE UNIQUE INDEX uniq_boosts_active_per_listing
  ON public.boosts (listing_id)
  WHERE status IN ('pending', 'active');

-- Index pour requetes rapides
CREATE INDEX idx_boosts_user_id
  ON public.boosts (user_id, created_at DESC);

CREATE INDEX idx_boosts_status
  ON public.boosts (status, created_at DESC);

CREATE INDEX idx_boosts_expires_at
  ON public.boosts (expires_at)
  WHERE status = 'active';

-- RLS
ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible par tous ou par proprietaire"
  ON public.boosts FOR SELECT
  TO public
  USING (
    status = 'active'
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Un utilisateur peut creer son propre boost"
  ON public.boosts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin peut modifier les boosts"
  ON public.boosts FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
