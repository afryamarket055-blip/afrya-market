import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

const SHOP_CATEGORIES = [
  'Electronique',
  'Mode',
  'Maison',
  'Beaute',
  'Sport',
  'Alimentation',
  'Services',
  'Autre',
]

function Settings() {
  const { user } = useAuth()

  const [phoneVisible, setPhoneVisible] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [shopName, setShopName] = useState('')
  const [shopCategory, setShopCategory] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [shopLogo, setShopLogo] = useState('')
  const [shopBanner, setShopBanner] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('phone_visible, is_pro, is_verified, shop_name, shop_category, shop_description, shop_logo, shop_banner')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erreur chargement parametres:', error)
        setLoading(false)
        return
      }

      setPhoneVisible(data.phone_visible || false)
      setIsPro(data.is_pro || false)
      setIsVerified(data.is_verified || false)
      setShopName(data.shop_name || '')
      setShopCategory(data.shop_category || '')
      setShopDescription(data.shop_description || '')
      setShopLogo(data.shop_logo || '')
      setShopBanner(data.shop_banner || '')
      setLoading(false)
    }
    loadProfile()
  }, [user])

  async function handleTogglePhoneVisible(event) {
    const next = event.target.checked
    setPhoneVisible(next)
    setSaving(true)
    setMessage('')
    setErrorMsg('')

    const { error } = await supabase
      .from('profiles')
      .update({ phone_visible: next })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      console.error('Erreur sauvegarde:', error)
      setPhoneVisible(!next)
      setErrorMsg('Erreur lors de la sauvegarde.')
      return
    }
    setMessage('Preference enregistree.')
  }

  async function handleTogglePro(event) {
    const next = event.target.checked
    setIsPro(next)
    setSaving(true)
    setMessage('')
    setErrorMsg('')

    const updates = { is_pro: next }
    if (next) updates.pro_since = new Date().toISOString()

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      console.error('Erreur activation boutique:', error)
      setIsPro(!next)
      setErrorMsg("Erreur lors de l'activation de la boutique.")
      return
    }
    setMessage(next ? 'Boutique activee.' : 'Boutique desactivee.')
  }

  function handleLogoChange(event) {
    const file = event.target.files[0]
    if (file) {
      setLogoFile(file)
      setShopLogo(URL.createObjectURL(file))
    }
  }

  function handleBannerChange(event) {
    const file = event.target.files[0]
    if (file) {
      setBannerFile(file)
      setShopBanner(URL.createObjectURL(file))
    }
  }

  async function uploadImage(file, prefix) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
    const path = 'shops/' + user.id + '/' + prefix + '-' + Date.now() + '-' + safeName

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(path, file)

    if (uploadError) {
      console.error('Erreur upload:', uploadError)
      throw new Error("Erreur lors de l'upload.")
    }

    const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSaveShop(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setErrorMsg('')

    try {
      let finalLogo = shopLogo
      let finalBanner = shopBanner

      if (logoFile) {
        finalLogo = await uploadImage(logoFile, 'logo')
      }
      if (bannerFile) {
        finalBanner = await uploadImage(bannerFile, 'banner')
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          shop_name: shopName.trim() || null,
          shop_category: shopCategory || null,
          shop_description: shopDescription.trim() || null,
          shop_logo: finalLogo || null,
          shop_banner: finalBanner || null,
        })
        .eq('id', user.id)

      setSaving(false)

      if (error) {
        console.error('Erreur sauvegarde boutique:', error)
        setErrorMsg('Erreur lors de la sauvegarde.')
        return
      }

      setLogoFile(null)
      setBannerFile(null)
      setShopLogo(finalLogo)
      setShopBanner(finalBanner)
      setMessage('Boutique enregistree.')
    } catch (err) {
      setSaving(false)
      setErrorMsg(err.message || 'Erreur.')
    }
  }

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main className="loading-state">
          <p>Chargement des parametres...</p>
        </main>
      </div>
    )
  }

  const hasShopInfo = shopName && shopCategory

  return (
    <div className="app settings-v2">
      <Nav />
      <main className="settings-page">
        <h1>Parametres</h1>
        <p className="settings-subtitle">
          Gerez votre compte et vos preferences.
        </p>

        <section className="settings-section">
          <h2>Compte</h2>
          <div className="settings-card">
            <Link to="/profil" className="settings-row settings-row-link">
              <div>
                <strong>Mon profil</strong>
                <p>Nom, bio, ville, photo</p>
              </div>
              <span className="settings-arrow">→</span>
            </Link>
            <Link to="/mes-annonces" className="settings-row settings-row-link">
              <div>
                <strong>Mes annonces</strong>
                <p>Gerer mes publications</p>
              </div>
              <span className="settings-arrow">→</span>
            </Link>
            <Link to="/favoris" className="settings-row settings-row-link">
              <div>
                <strong>Mes favoris</strong>
                <p>Annonces enregistrees</p>
              </div>
              <span className="settings-arrow">→</span>
            </Link>
          </div>
        </section>

        <section className="settings-section">
          <h2>Boutique pro</h2>
          <div className="settings-card">
            <label className="settings-row settings-row-toggle">
              <div>
                <strong>Activer ma boutique</strong>
                <p>
                  Vendez sous un nom de boutique. Vos annonces seront
                  identifiables et regroupees sur une page dediee.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isPro}
                onChange={handleTogglePro}
                disabled={saving}
              />
            </label>

            {isPro && (
              <form className="shop-form" onSubmit={handleSaveShop}>
                {isVerified && (
                  <div className="shop-verified-banner">
                    ✓ Boutique verifiee par AFRYA MARKET
                  </div>
                )}

                <div className="settings-row settings-row-form">
                  <div className="form-group">
                    <label htmlFor="shopName">Nom de la boutique</label>
                    <input
                      id="shopName"
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Ex : Tech Plus Cotonou"
                      maxLength={60}
                    />
                    <small className="form-hint">
                      {shopName.length} / 60 caracteres
                    </small>
                  </div>
                </div>

                <div className="settings-row settings-row-form">
                  <div className="form-group">
                    <label htmlFor="shopCategory">Categorie principale</label>
                    <select
                      id="shopCategory"
                      value={shopCategory}
                      onChange={(e) => setShopCategory(e.target.value)}
                    >
                      <option value="">Choisir une categorie</option>
                      {SHOP_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="settings-row settings-row-form">
                  <div className="form-group">
                    <label htmlFor="shopDescription">Description</label>
                    <textarea
                      id="shopDescription"
                      value={shopDescription}
                      onChange={(e) => setShopDescription(e.target.value)}
                      placeholder="Presentez votre boutique en quelques phrases..."
                      maxLength={500}
                      rows={3}
                    />
                    <small className="form-hint">
                      {shopDescription.length} / 500 caracteres
                    </small>
                  </div>
                </div>

                <div className="settings-row settings-row-form">
                  <div className="form-group">
                    <label>Logo de la boutique</label>
                    <div className="shop-upload-block">
                      {shopLogo ? (
                        <img src={shopLogo} alt="Logo" className="shop-logo-preview" />
                      ) : (
                        <div className="shop-logo-preview shop-logo-placeholder">
                          Logo
                        </div>
                      )}
                      <label htmlFor="shopLogo" className="btn btn-secondary btn-sm">
                        Choisir un logo
                      </label>
                      <input
                        id="shopLogo"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoChange}
                        hidden
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-row settings-row-form">
                  <div className="form-group">
                    <label>Banniere de la boutique</label>
                    <div className="shop-upload-block shop-upload-block-banner">
                      {shopBanner ? (
                        <img src={shopBanner} alt="Banniere" className="shop-banner-preview" />
                      ) : (
                        <div className="shop-banner-preview shop-banner-placeholder">
                          Banniere
                        </div>
                      )}
                      <label htmlFor="shopBanner" className="btn btn-secondary btn-sm">
                        Choisir une banniere
                      </label>
                      <input
                        id="shopBanner"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleBannerChange}
                        hidden
                      />
                    </div>
                  </div>
                </div>

                {message && <p className="form-success">{message}</p>}
                {errorMsg && <p className="form-error">{errorMsg}</p>}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !hasShopInfo}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer ma boutique'}
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="settings-section">
          <h2>Confidentialite</h2>
          <div className="settings-card">
            <label className="settings-row settings-row-toggle">
              <div>
                <strong>Afficher mon telephone publiquement</strong>
                <p>
                  Si active, votre numero apparait sur votre profil public
                  et sur vos annonces.
                </p>
              </div>
              <input
                type="checkbox"
                checked={phoneVisible}
                onChange={handleTogglePhoneVisible}
                disabled={saving}
              />
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>Securite</h2>
          <div className="settings-card">
            <div className="settings-row settings-row-disabled">
              <div>
                <strong>Mot de passe</strong>
                <p>Modifier votre mot de passe</p>
              </div>
              <span className="settings-badge">Bientot</span>
            </div>
            <div className="settings-row settings-row-disabled">
              <div>
                <strong>Sessions actives</strong>
                <p>Gerer les appareils connectes</p>
              </div>
              <span className="settings-badge">Bientot</span>
            </div>
            <div className="settings-row settings-row-disabled">
              <div>
                <strong>Supprimer mon compte</strong>
                <p>Action irreversible</p>
              </div>
              <span className="settings-badge">Bientot</span>
            </div>
          </div>
        </section>

        {!isPro && (message || errorMsg) && (
          <>
            {message && <p className="form-success">{message}</p>}
            {errorMsg && <p className="form-error">{errorMsg}</p>}
          </>
        )}
      </main>
    </div>
  )
}

export default Settings
