// src/lib/imageCompression.js
// Compression cote client avant upload vers Supabase Storage.
// Reduit les photos smartphone (2-5 MB) a ~300-500 KB.

import imageCompression from 'browser-image-compression'

const MAX_SIZE_MB = 0.5        // 500 KB cible
const MAX_DIMENSION = 1600     // 1600px cote le plus long

/**
 * Compresse une image en preservant son format (JPG/WEBP -> JPG, PNG -> PNG).
 * En cas d'echec, retourne le fichier original (fail-safe).
 */
export async function compressImage(file) {
  if (!file || !file.type?.startsWith('image/')) return file

  const isPng = file.type === 'image/png'

  const options = {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_DIMENSION,
    useWebWorker: true,
    fileType: isPng ? 'image/png' : 'image/jpeg',
    initialQuality: 0.85,
    preserveExif: false,
  }

  try {
    return await imageCompression(file, options)
  } catch (err) {
    console.warn('[imageCompression] echec, original conserve :', err)
    return file
  }
}


/**
 * Retourne l'extension correcte selon le type MIME.
 */
export function extensionForMime(mime) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

/**
 * Compresse ET renomme le fichier pour que l'extension matche le type.
 */
export async function compressAndRename(file) {
  const compressed = await compressImage(file)
  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '-')
  const ext = extensionForMime(compressed.type)
  const renamed = new File([compressed], `${baseName}.${ext}`, { type: compressed.type })
  return renamed
}
