-- ============================================================
-- 20260910_04_add_indexes.sql
-- Objectif : ajouter les index métier sur les colonnes fréquemment filtrées
-- Note : PostgreSQL ne crée PAS d'index automatiques sur les FK
-- ============================================================

CREATE INDEX idx_listings_user_id
  ON public.listings (user_id);

CREATE INDEX idx_listings_created_at
  ON public.listings (created_at DESC);

CREATE INDEX idx_listings_category
  ON public.listings (category);

CREATE INDEX idx_listing_images_listing_id
  ON public.listing_images (listing_id);

CREATE INDEX idx_conversations_buyer_id
  ON public.conversations (buyer_id);

CREATE INDEX idx_conversations_seller_id
  ON public.conversations (seller_id);

CREATE INDEX idx_messages_conversation_created
  ON public.messages (conversation_id, created_at);

CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id)
  WHERE read = false;
