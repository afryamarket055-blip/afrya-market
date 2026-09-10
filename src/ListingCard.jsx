function ListingCard({ title, price, location, condition, category, image, status }) {
  return (
    <article className="listing-card card">
      <div className="listing-image">
        <img src={image} alt={title} loading="lazy" />
        {status === 'vendu' && (
          <span className="badge badge-sold listing-badge">VENDU</span>
        )}
        <button
          type="button"
          className="listing-fav-btn"
          aria-label="Ajouter aux favoris"
          onClick={(event) => event.preventDefault()}
        >
          ❤️
        </button>
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
