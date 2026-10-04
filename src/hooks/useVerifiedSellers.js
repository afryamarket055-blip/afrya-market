import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function useVerifiedSellers(listings) {
  const [verifiedIds, setVerifiedIds] = useState(new Set())

  useEffect(() => {
    if (!listings || listings.length === 0) {
      setVerifiedIds(new Set())
      return
    }

    const uniqueIds = Array.from(
      new Set(listings.map((l) => l.user_id).filter(Boolean))
    )

    if (uniqueIds.length === 0) {
      setVerifiedIds(new Set())
      return
    }

    async function load() {
      const { data, error } = await supabase
        .from('profiles_public')
        .select('id')
        .in('id', uniqueIds)
        .eq('is_verified', true)

      if (error) {
        console.error('Erreur chargement vendeurs verifies :', error)
        return
      }

      setVerifiedIds(new Set((data || []).map((p) => p.id)))
    }

    load()
  }, [listings])

  return verifiedIds
}
