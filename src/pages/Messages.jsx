import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

function formatRelativeDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "a l'instant"
  if (diffMin < 60) return 'il y a ' + diffMin + ' min'
  if (diffH < 24) return 'il y a ' + diffH + 'h'
  if (diffD === 1) return 'hier'
  if (diffD < 7) return 'il y a ' + diffD + ' jours'

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  })
}

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
            .from('profiles_public')
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
    <div className="app messages-v2">
      <Nav />
      <main className="messages-page">
        <header className="messages-header">
          <h1>Messages</h1>
          {!loading && !error && conversations.length > 0 && (
            <p className="messages-count">
              {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
            </p>
          )}
        </header>

        {loading ? (
          <div className="loading-state">
            <p>Chargement...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <p>Impossible de charger vos conversations.</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>Vous n'avez aucune conversation pour l'instant.</p>
            <Link
              to="/annonces"
              className="btn btn-primary"
              style={{ marginTop: '12px' }}
            >
              Parcourir les annonces
            </Link>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conversation) => {
              const name =
                conversation.otherProfile?.full_name ||
                'Utilisateur AFRYA MARKET'
              const preview =
                conversation.lastMessage?.content ||
                'A propos de : ' +
                  (conversation.listings?.title || 'une annonce')
              const date = formatRelativeDate(conversation.lastMessage?.created_at)

              return (
                <Link
                  key={conversation.id}
                  to={'/conversation/' + conversation.id}
                  className="conversation-card"
                >
                  {conversation.otherProfile?.avatar_url ? (
                    <img
                      src={conversation.otherProfile.avatar_url}
                      alt={name}
                      className="conversation-avatar"
                    />
                  ) : (
                    <div className="conversation-avatar conversation-avatar-placeholder">
                      👤
                    </div>
                  )}

                  <div className="conversation-body">
                    <div className="conversation-top">
                      <strong className="conversation-name">{name}</strong>
                      {date && (
                        <span className="conversation-date">{date}</span>
                      )}
                    </div>
                    <p className="conversation-preview">{preview}</p>
                  </div>

                  {conversation.listings?.image && (
                    <img
                      src={conversation.listings.image}
                      alt={conversation.listings.title}
                      className="conversation-listing-thumb"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Messages
