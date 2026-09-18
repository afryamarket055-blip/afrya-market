-- ============================================================
-- 20260918_21_add_orders_table.sql
-- Objectif : systeme de commandes (AFRYA DEAL) entre acheteur
-- et vendeur. Paiement manuel MoMo pour l'instant, PayDunya plus tard.
-- ============================================================

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  listing_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  price numeric NOT NULL,
  delivery_method text NOT NULL DEFAULT 'pickup',
  delivery_address text,
  buyer_note text,
  deal_signed_buyer_at timestamptz,
  deal_signed_seller_at timestamptz,
  payment_method text DEFAULT 'manual_momo',
  payment_reference text,
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid,
  cancel_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_orders_buyer_id
    FOREIGN KEY (buyer_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_orders_seller_id
    FOREIGN KEY (seller_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_orders_listing_id
    FOREIGN KEY (listing_id) REFERENCES public.listings(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_orders_status
    CHECK (status IN ('pending', 'accepted', 'deal_locked', 'paid', 'shipped', 'delivered', 'completed', 'cancelled')),
  CONSTRAINT chk_orders_delivery_method
    CHECK (delivery_method IN ('pickup', 'delivery')),
  CONSTRAINT chk_orders_price_positive
    CHECK (price > 0),
  CONSTRAINT chk_orders_not_self
    CHECK (buyer_id <> seller_id),
  CONSTRAINT chk_orders_delivery_address
    CHECK (delivery_method <> 'delivery' OR delivery_address IS NOT NULL)
);

-- Un acheteur ne peut avoir qu'une seule commande active par annonce
CREATE UNIQUE INDEX uniq_orders_buyer_listing_active
  ON public.orders (buyer_id, listing_id)
  WHERE status NOT IN ('cancelled', 'completed');

-- Index pour requetes rapides
CREATE INDEX idx_orders_buyer_id
  ON public.orders (buyer_id, created_at DESC);

CREATE INDEX idx_orders_seller_id
  ON public.orders (seller_id, created_at DESC);

CREATE INDEX idx_orders_listing_id
  ON public.orders (listing_id);

CREATE INDEX idx_orders_status
  ON public.orders (status, created_at DESC);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- SELECT : acheteur OU vendeur OU admin
CREATE POLICY "Les parties et admins voient la commande"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- INSERT : seul l'acheteur peut creer sa propre commande
CREATE POLICY "Un acheteur peut creer une commande"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id
    AND auth.uid() <> seller_id
  );

-- UPDATE : acheteur OU vendeur OU admin
-- (les transitions de statut sont controlees cote applicatif)
CREATE POLICY "Les parties et admins peuvent mettre a jour"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Pas de DELETE : les commandes sont historisees
