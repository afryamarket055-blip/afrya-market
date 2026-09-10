# Supabase — Migrations

Ce dossier documente les modifications faites sur la base de données Supabase.

## Règle

Toute modification de schéma (table, colonne, FK, index, policy RLS) doit être :
1. Exécutée dans le dashboard Supabase → SQL Editor
2. Documentée ici dans un fichier `YYYYMMDDHHMMSS_description.sql`
3. Committée dans Git

## Ordre d'application

Les fichiers sont numérotés par date. Ils s'appliquent dans l'ordre chronologique.

| Fichier | Description |
|---|---|
| 20260910000001_fix_listings_insert_policy.sql | Retire la policy INSERT trop permissive sur `listings` |
| 20260910000002_fix_storage_listing_images_policy.sql | Restreint l'upload Storage aux utilisateurs connectés |
| 20260910000003_add_foreign_keys.sql | Ajoute 8 FK sur les tables principales |
| 20260910000004_add_indexes.sql | Ajoute 8 index métier |

## En cas de reset de la base

Exécuter les fichiers dans l'ordre ci-dessus depuis le SQL Editor de Supabase.

## Note

Ces migrations ne couvrent pas la création initiale des tables (`profiles`,
`listings`, `listing_images`, `conversations`, `messages`, `notifications`) —
celles-ci ont été créées manuellement dans le dashboard Supabase.

À terme : générer une migration `00000000_initial_schema.sql` qui décrit
l'état de départ, pour permettre une reconstruction complète.
