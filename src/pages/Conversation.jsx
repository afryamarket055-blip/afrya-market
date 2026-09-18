import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDayLabel(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const y = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

  if (d.getTime() === t.getTime()) return "Aujourd'hui"
  if (d.getTime() === y.getTime()) return 'Hier'

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

function Conversation() {
  const { id } = useParams()
  const { user } = useAuth()

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const [otherProfile, setOtherProfile] = useState(null)
  const [listingInfo, setListingInfo] = useState(null)
  const [otherUserId, setOtherUserId] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    async function loadConversationInfo() {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*, listings(title, image)')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erreur chargement conversation :', error)
        setError(error.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      setListingInfo(conversation.listings)

      const otherId =
        conversation.buyer_id === user?.id
          ? conversation.seller_id
          : conversation.buyer_id

      setOtherUserId(otherId)

      const { data: profile, error: profileError } = await supabase
        .from('profiles_public')
        .select('full_name, avatar_url')
        .eq('id', otherId)
        .single()

      if (profileError) {
        console.error('Erreur chargement profil :', profileError)
        setError(profileError.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      setOtherProfile(profile)
    }

    if (user) {
      loadConversationInfo()
    }
  }, [id, user])

  useEffect(() => {
    async function loadMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Erreur chargement messages :', error)
        setError(error.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      setMessages(data || [])
      setLoading(false)
    }

    loadMessages()
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel('conversation-' + id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'conversation_id=eq.' + id,
        },
        (payload) => {
          setMessages((previous) => {
            const alreadyExists = previous.some(
              (message) => message.id === payload.new.id
            )
            if (alreadyExists) return previous
            return [...previous, payload.new]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(event) {
    event.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: id,
          sender_id: user.id,
          content: newMessage.trim(),
        },
      ])
      .select()
      .single()

    setSending(false)

    if (error) {
      console.error('Erreur envoi message :', error)
      alert("Erreur lors de l'envoi du message.")
      return
    }

    setMessages((previous) => [...previous, data])
    setNewMessage('')
  }

  if (error) {
    return (
      <div className="app">
        <Nav />
        <main className="conversation-page">
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <p>Impossible de charger la conversation.</p>
            <Link to="/messages" className="btn btn-secondary" style={{ marginTop: '12px' }}>
              Retour aux messages
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main className="conversation-page">
          <div className="loading-state">
            <p>Chargement de la conversation...</p>
          </div>
        </main>
      </div>
    )
  }

  // Regrouper les messages par jour
  const grouped = []
  let currentDay = null
  for (const message of messages) {
    const day = new Date(message.created_at).toDateString()
    if (day !== currentDay) {
      grouped.push({ type: 'day', label: formatDayLabel(message.created_at), key: 'day-' + day })
      currentDay = day
    }
    grouped.push({ type: 'msg', message })
  }

  return (
    <div className="app conversation-v2">
      <Nav />
      <main className="conversation-page">
        <header className="conversation-header">
          <Link to="/messages" className="conversation-back" aria-label="Retour">
            ←
          </Link>

          {otherProfile?.avatar_url ? (
            <img
              src={otherProfile.avatar_url}
              alt={otherProfile.full_name || 'Utilisateur'}
              className="conversation-avatar"
            />
          ) : (
            <div className="conversation-avatar conversation-avatar-placeholder">
              👤
            </div>
          )}

          <div className="conversation-header-info">
            <strong className="conversation-header-name">
              {otherUserId ? (
                <Link to={'/vendeur/' + otherUserId}>
                  {otherProfile?.full_name || 'Utilisateur AFRYA MARKET'}
                </Link>
              ) : (
                otherProfile?.full_name || 'Utilisateur AFRYA MARKET'
              )}
            </strong>
            {listingInfo?.title && (
              <span className="conversation-header-sub">
                A propos de : {listingInfo.title}
              </span>
            )}
          </div>

          {listingInfo?.image && (
            <img
              src={listingInfo.image}
              alt={listingInfo.title}
              className="conversation-header-listing"
            />
          )}
        </header>

        <div className="conversation-messages">
          {messages.length === 0 ? (
            <div className="conversation-empty">
              <p>Aucun message pour l'instant. Dites bonjour !</p>
            </div>
          ) : (
            grouped.map((item) => {
              if (item.type === 'day') {
                return (
                  <div key={item.key} className="conversation-day">
                    <span>{item.label}</span>
                  </div>
                )
              }
              const message = item.message
              const isMine = message.sender_id === user.id
              return (
                <div
                  key={message.id}
                  className={'bubble-row ' + (isMine ? 'is-mine' : 'is-other')}
                >
                  <div className={'bubble ' + (isMine ? 'bubble-mine' : 'bubble-other')}>
                    {message.content}
                  </div>
                  <span className="bubble-time">{formatTime(message.created_at)}</span>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form className="conversation-form" onSubmit={handleSend}>
          <input
            type="text"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Ecrivez un message..."
            className="conversation-input"
          />
          <button
            type="submit"
            className="conversation-send"
            disabled={sending || !newMessage.trim()}
            aria-label="Envoyer"
          >
            ➤
          </button>
        </form>
      </main>
    </div>
  )
}

export default Conversation
