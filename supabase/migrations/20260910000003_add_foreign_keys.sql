-- ============================================================
-- 20260910_03_add_foreign_keys.sql
-- Objectif : garantir l'intégrité référentielle entre les tables
-- Règles ON DELETE :
--   CASCADE   = la ligne enfant est supprimée avec le parent
--   SET NULL  = la colonne enfant devient NULL
-- ============================================================

-- 1. listings.user_id -> profiles.id
ALTER TABLE public.listings
  ADD CONSTRAINT fk_listings_user_id
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- 2. listing_images.listing_id -> listings.id
ALTER TABLE public.listing_images
  ADD CONSTRAINT fk_listing_images_listing_id
  FOREIGN KEY (listing_id) REFERENCES public.listings(id)
  ON DELETE CASCADE;

-- 3. conversations.buyer_id -> profiles.id
ALTER TABLE public.conversations
  ADD CONSTRAINT fk_conversations_buyer_id
  FOREIGN KEY (buyer_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- 4. conversations.seller_id -> profiles.id
ALTER TABLE public.conversations
  ADD CONSTRAINT fk_conversations_seller_id
  FOREIGN KEY (seller_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- 5. conversations.listing_id -> listings.id
ALTER TABLE public.conversations
  ADD CONSTRAINT fk_conversations_listing_id
  FOREIGN KEY (listing_id) REFERENCES public.listings(id)
  ON DELETE SET NULL;

-- 6. messages.conversation_id -> conversations.id
ALTER TABLE public.messages
  ADD CONSTRAINT fk_messages_conversation_id
  FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
  ON DELETE CASCADE;

-- 7. messages.sender_id -> profiles.id
ALTER TABLE public.messages
  ADD CONSTRAINT fk_messages_sender_id
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- 8. notifications.user_id -> profiles.id
ALTER TABLE public.notifications
  ADD CONSTRAINT fk_notifications_user_id
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;
