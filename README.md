# AFRYA MARKET

Marketplace numérique africaine — achat et vente entre particuliers
et professionnels. Marché initial : 🇧🇯 Bénin.

## Stack
- React 19 + Vite 8
- React Router 7
- Supabase (Auth, Database, Storage, Realtime)
- CSS pur

## Installation
npm install
cp .env.example .env.local
# Éditer .env.local, remplir les valeurs
npm run dev

URL : http://localhost:5173/

## Variables d'environnement
Fichier `.env.local` (jamais versionné) :
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

Où les trouver : Supabase → Settings → API

## Scripts
- npm run dev       → serveur de développement
- npm run build     → build de production
- npm run preview   → prévisualiser le build
- npm run lint      → ESLint

## Base de données
- RLS activée sur toutes les tables publiques
- Triggers : handle_new_user, handle_new_message, rls_auto_enable
- Storage : bucket listing-images

## Migrations
Voir supabase/migrations/. Pour appliquer : copier dans
Supabase → SQL Editor → Run.

## Roadmap
- ✅ Phase 0 — Stabilisation
- 🔜 Phase 1 — UI/UX
- 🔜 Phase 2 — Profil + Paramètres
- 🔜 Phase 3 — Likes, Favoris, Vues
- 🔜 Phase 4 à 10 — Analytics, Confiance, Algo, Business

## Organisation
Projet AFRYA ONE — © 2026
