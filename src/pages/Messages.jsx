import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadConversations() {
      if (!user) return

      const { data, error } = await supabase
        .from('conversations')
        .select('*, listings(title, image)')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement conversations :', error)
        setError(error.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      const enriched = await Promise.all(
        data.map(async (conversation) => {
          const otherUserId =
            conversation.buyer_id === user.id
              ? conversation.seller_id
              : conversation.buyer_id

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', otherUserId)
            .single()

          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          return {
            ...conversation,
            otherProfile: profile,
            lastMessage: lastMessageData,
          }
        })
      )

      setConversations(enriched)
      setLoading(false)
    }

    loadConversations()
  }, [user])

  return (
    <div className="app">
      <Nav />
      <main style={{ padding: '40px 20px', maxWidth: '650px', margin: '0 auto' }}>
        <h1>Messages</h1>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p>Impossible de charger vos conversations. Réessayez plus tard.</p>
        ) : conversations.length === 0 ? (
          <p>Vous n'avez aucune conversation pour l'instant.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                to={`/conversation/${conversation.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                {conversation.otherProfile?.avatar_url ? (
                  <img
                    src={conversation.otherProfile.avatar_url}
                    alt={conversation.otherProfile.full_name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0,
                    }}
                  >
                    👤
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>
                    {conversation.otherProfile?.full_name ||
                      'Utilisateur AFRYA MARKET'}
                  </strong>
                  <p
                    style={{
                      margin: '2px 0 0',
                      fontSize: '13px',
                      color: '#6b7280',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {conversation.lastMessage?.content ||
                      `À propos de : ${conversation.listings?.title || 'une annonce'}`}
                  </p>
                </div>

                {conversation.listings?.image && (
                  <img
                    src={conversation.listings.image}
                    alt={conversation.listings.title}
                    style={{
                      width: '44px',
                      height: '44px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      flexShrink: 0,
                    }}
                  />
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Messages
