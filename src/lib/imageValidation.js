// src/lib/imageValidation.js
// Validation client des images avant upload vers Supabase Storage.
//
// IMPORTANT : ceci est une protection UX (confort utilisateur).
// La securite REELLE est appliquee cote bucket Supabase
// (Allowed MIME types + File size limit dans le Dashboard).
// Le frontend seul ne protege PAS contre un attaquant.

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const MAX_IMAGE_SIZE = 8 * 1024 * 1024 // 8 MB

export const MAX_IMAGES_PER_LISTING = 5

export function validateImageFile(file) {
  if (!file) {
    return { valid: false, reason: 'Aucun fichier selectionne.' }
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      reason: 'Format non supporte. Utilisez JPG, PNG ou WEBP.',
    }
  }
  if (file.size > MAX_IMAGE_SIZE) {
    const maxMb = Math.round(MAX_IMAGE_SIZE / 1024 / 1024)
    return {
      valid: false,
      reason: 'Image trop lourde. Maximum ' + maxMb + ' MB.',
    }
  }
  return { valid: true }
}
