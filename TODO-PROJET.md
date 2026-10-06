
## Phase 1 — Lot A — TERMINÉ (2026-10-06)

- [x] A.1 Validation uploads (MIME + taille + contentType)
- [x] A.2 Page 404 custom
- [x] A.3 Nettoyage 4 policies RLS orphelines sur listings
- [x] A.4 Honeypot anti-bot + rate limits Supabase (30/5min)
- [x] A.5 Reset password (SMTP Brevo opérationnel)

## À retenir pour plus tard

- Clé SMTP Brevo actuelle : conservée dans Supabase
  → Si Brevo affiche un jour "clé expirée", régénérer + recoller
- Le bucket `listing-images` a 8 MB max + MIME types restreints
  → Ne pas relâcher ces réglages
- Site URL Supabase = https://afrya-market.onrender.com
