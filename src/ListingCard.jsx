import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'

function ListingCard({ id, title, price, location, condition, category, image, status }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [viewsCount, setViewsCount] = useState(0)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    async function loadLikeState() {
      if (!id) return

      const { count } = await supabase
        .from('listing_likes')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', id)
      setLikesCount(count || 0)

      if (user) {
        const { data } = await supabase
          .from('listing_likes')
          .select('id')
          .eq('listing_id', id)
          .eq('user_id', user.id)
          .maybeSingle()
        setLiked(!!data)
      } else {
        setLiked(false)
      }
    }
    loadLikeState()
  }, [id, user])

    useEffect(() => {
      async function loadViewsCount() {
        if (!id) return
        const { count } = await supabase
          .from('listing_views')
          .select('*', { count: 'exact', head: true })
          .eq('listing_id', id)
        setViewsCount(count || 0)
      }
      loadViewsCount()
    }, [id])

  async function handleToggleLike(event) {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      navigate('/connexion')
      return
    }
    if (pending || !id) return

    setPending(true)

    if (liked) {
      const { error } = await supabase
        .from('listing_likes')
        .delete()
        .eq('listing_id', id)
        .eq('user_id', user.id)
      if (!error) {
        setLiked(false)
        setLikesCount((c) => Math.max(0, c - 1))
      }
    } else {
      const { error } = await supabase
        .from('listing_likes')
        .insert([{ listing_id: id, user_id: user.id }])
      if (!error) {
        setLiked(true)
        setLikesCount((c) => c + 1)
      }
    }

    setPending(false)
  }

  return (
    <article className="listing-card card">
      <div className="listing-image">
        <img src={image} alt={title} loading="lazy" />
        {status === 'vendu' && (
          <span className="badge badge-sold listing-badge">VENDU</span>
        )}
        <button
          type="button"
          className={`listing-fav-btn ${liked ? 'is-liked' : ''}`}
          aria-label={liked ? 'Retirer le like' : 'Ajouter un like'}
          onClick={handleToggleLike}
          disabled={pending}
        >
          {liked ? '❤' : '🤍'}
        </button>
        {viewsCount > 0 && (
            <span className="listing-view-count">👁 {viewsCount}</span>
          )}
          {likesCount > 0 && (
          <span className="listing-like-count">❤ {likesCount}</span>
        )}
      </div>
      <div className="listing-content">
        <span className="listing-category">{category}</span>
        <h4>{title}</h4>
        <strong className="listing-price">{price} FCFA</strong>
        <p className="listing-location">📍 {location}</p>
        <div className="listing-footer">
          <span className="condition">{condition}</span>
        </div>
      </div>
    </article>
  )
}

export default ListingCard
