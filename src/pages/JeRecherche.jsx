import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'

function JeRecherche() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    budget_min: '',
    budget_max: '',
    city: '',
    condition_min: '',
    delivery: false,
    deadline: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setErrorMsg('')

    if (!user) {
      setErrorMsg('Vous devez etre connecte pour publier une demande.')
      setSaving(false)
      return
    }

    const payload = {
      user_id: user.id,
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim() || null,
      budget_min: formData.budget_min ? Number(formData.budget_min) : null,
      budget_max: formData.budget_max ? Number(formData.budget_max) : null,
      city: formData.city.trim(),
      condition_min: formData.condition_min || null,
      delivery: formData.delivery,
      deadline: formData.deadline || null,
      status: 'active',
    }

    const { data, error } = await supabase
      .from('demands')
      .insert([payload])
      .select()
      .single()

    setSaving(false)

    if (error) {
      console.error('Erreur creation demande :', error)
      setErrorMsg("Erreur lors de la publication de la demande.")
      return
    }

    setMessage('Votre demande a ete publiee avec succes !')
    setTimeout(() => {
      navigate('/demandes/' + data.id)
    }, 1000)
  }

  return (
    <div className="app">
      <Nav />
      <main className="create-listing-page">
        <div className="create-listing-header">
          <Link to="/demandes" className="back-link">
            ← Retour aux demandes
          </Link>
          <span className="page-badge">AFRYA MARKET</span>
          <h1>Je recherche un article</h1>
          <p>
            Decrivez ce que vous cherchez. Les vendeurs pourront vous proposer
            leurs produits correspondants.
          </p>
        </div>

        <form className="listing-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <div className="form-section-title">
              <span>01</span>
              <div>
                <h2>Ce que je cherche</h2>
                <p>Plus votre description est precise, plus vous recevrez de propositions pertinentes.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title">Titre de la demande</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Ex : iPhone 13 128 Go"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Categorie</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Choisir une categorie</option>
                <option value="Téléphones">📱 Téléphones</option>
                <option value="Informatique">💻 Informatique</option>
                <option value="Électroménager">📺 Électroménager</option>
                <option value="Mode">👕 Mode</option>
                <option value="Maison">🛋 Maison</option>
                <option value="Véhicules">🏍 Véhicules</option>
                <option value="Autres">📦 Autres</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (optionnel)</label>
              <textarea
                id="description"
                name="description"
                rows="5"
                placeholder="Precisez la marque, le modele, la couleur, les accessoires souhaites..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title">
              <span>02</span>
              <div>
                <h2>Budget et localisation</h2>
                <p>Ces criteres nous aident a trouver les annonces correspondantes.</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget_min">Budget minimum (FCFA)</label>
                <input
                  id="budget_min"
                  name="budget_min"
                  type="number"
                  min="0"
                  placeholder="150000"
                  value={formData.budget_min}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget_max">Budget maximum (FCFA)</label>
                <input
                  id="budget_max"
                  name="budget_max"
                  type="number"
                  min="0"
                  placeholder="200000"
                  value={formData.budget_max}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Ville</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Ex : Cotonou"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="condition_min">Etat minimum accepte</label>
                <select
                  id="condition_min"
                  name="condition_min"
                  value={formData.condition_min}
                  onChange={handleChange}
                >
                  <option value="">Peu importe</option>
                  <option value="Neuf">Neuf</option>
                  <option value="Comme neuf">Comme neuf</option>
                  <option value="Très bon état">Très bon état</option>
                  <option value="Bon état">Bon état</option>
                  <option value="État correct">État correct</option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title">
              <span>03</span>
              <div>
                <h2>Preferences</h2>
                <p>Facultatif.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Date limite (optionnel)</label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <label className="profile-checkbox">
              <input
                type="checkbox"
                name="delivery"
                checked={formData.delivery}
                onChange={handleChange}
              />
              <span>Je souhaite une livraison</span>
            </label>
          </section>

          {message && <div className="form-success">✓ {message}</div>}
          {errorMsg && <div className="form-error">{errorMsg}</div>}

          <button type="submit" className="publish-button" disabled={saving}>
            {saving ? 'Publication...' : 'Publier ma demande →'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default JeRecherche
