import { supabase } from './supabase'

/**
 * Envoie un email transactionnel via l'Edge Function Supabase.
 * Ne bloque JAMAIS l'action principale (fire and forget).
 */
export async function sendEmail(type, to, data) {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: { type, to, data },
    })
    if (error) {
      console.error('Erreur envoi email:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Exception envoi email:', err)
    return false
  }
}
