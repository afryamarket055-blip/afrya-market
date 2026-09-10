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

function Conversation() {
  const { id } = useParams()
  const { user } = useAuth()

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
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
        return
      }

      setListingInfo(conversation.listings)

      const otherUserId =
        conversation.buyer_id === user?.id
          ? conversation.seller_id
          : conversation.buyer_id

      setOtherUserId(otherUserId)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', otherUserId)
        .single()

      if (profileError) {
        console.error('Erreur chargement profil :', profileError)
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
        setLoading(false)
        return
      }

      setMessages(data)
      setLoading(false)
    }

    loadMessages()
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel(`conversation-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
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
    if (!newMessage.trim()) return

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

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main style={{ padding: '80px 20px', textAlign: 'center' }}>
          <p>Chargement de la conversation...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <Nav />
      <main
        style={{
          padding: '20px',
          maxWidth: '650px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          height: '85vh',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingBottom: '14px',
            borderBottom: '1px solid #e5e7eb',
            marginBottom: '14px',
          }}
        >
          <Link
            to="/messages"
            style={{ fontSize: '20px', textDecoration: 'none', color: 'inherit' }}
          >
            ←
          </Link>

          {otherProfile?.avatar_url ? (
            <img
              src={otherProfile.avatar_url}
              alt={otherProfile.full_name || 'Utilisateur'}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              👤
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong>
              <Link to={`/vendeur/${otherUserId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {otherProfile?.full_name || 'Utilisateur AFRYA MARKET'}
              </Link>
            </strong>
            {listingInfo?.title && (
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                À propos de : {listingInfo.title}
              </span>
            )}
          </div>

          {listingInfo?.image && (
            <img
              src={listingInfo.image}
              alt={listingInfo.title}
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'cover',
                borderRadius: '6px',
                marginLeft: 'auto',
              }}
            />
          )}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              Aucun message pour l'instant. Dites bonjour !
            </p>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_id === user.id
              return (
                <div
                  key={message.id}
                  style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      background: isMine ? '#1d4ed8' : '#f3f4f6',
                      color: isMine ? 'white' : 'black',
                      padding: '10px 16px',
                      borderRadius: isMine
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      wordBreak: 'break-word',
                    }}
                  >
                    {message.content}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      marginTop: '2px',
                      padding: '0 4px',
                    }}
                  >
                    {formatTime(message.created_at)}
                  </span>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          style={{
            display: 'flex',
            gap: '10px',
            paddingTop: '14px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Écrivez un message..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '20px',
              border: '1px solid #d1d5db',
            }}
          />
          <button
            type="submit"
            disabled={sending}
            style={{
              borderRadius: '20px',
              padding: '10px 20px',
            }}
          >
            Envoyer
          </button>
        </form>
      </main>
    </div>
  )
}

export default Conversation
