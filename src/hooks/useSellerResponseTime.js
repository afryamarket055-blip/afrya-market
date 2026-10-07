import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const MIN_SAMPLES = 5

/**
 * Calcule le temps de reponse moyen d'un vendeur.
 * Retourne { avg_minutes, samples_count } ou null.
 * Affiche rien si samples_count < MIN_SAMPLES (anti-invention).
 */
export function useSellerResponseTime(sellerId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sellerId) {
      setData(null)
      setLoading(false)
      return
    }

    async function load() {
      const { data: rows, error } = await supabase.rpc('seller_response_time', {
        seller_uuid: sellerId,
      })

      if (error) {
        console.error('Erreur calcul temps de reponse :', error)
        setData(null)
        setLoading(false)
        return
      }

      const row = Array.isArray(rows) ? rows[0] : null
      if (row && row.samples_count >= MIN_SAMPLES) {
        setData(row)
      } else {
        setData(null)
      }
      setLoading(false)
    }

    load()
  }, [sellerId])

  return { data, loading }
}

/**
 * Formate un nombre de minutes en texte court.
 * < 60 min  -> "Xmin"
 * < 24h     -> "Xh"
 * sinon     -> "Xj"
 */
export function formatResponseTime(minutes) {
  if (minutes == null) return null
  if (minutes < 60) return Math.round(minutes) + 'min'
  if (minutes < 1440) return Math.round(minutes / 60) + 'h'
  return Math.round(minutes / 1440) + 'j'
}
