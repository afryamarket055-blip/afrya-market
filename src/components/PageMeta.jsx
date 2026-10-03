import { useEffect } from 'react'

const DEFAULT_IMAGE = '/og-image.png'
const SITE_NAME = 'AFRYA MARKET'

function setMeta(selector, attr, value) {
  let tag = document.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    if (selector.includes('property=')) {
      tag.setAttribute('property', selector.match(/property="([^"]+)"/)[1])
    } else if (selector.includes('name=')) {
      tag.setAttribute('name', selector.match(/name="([^"]+)"/)[1])
    }
    document.head.appendChild(tag)
  }
  tag.setAttribute(attr, value)
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

function PageMeta({ title, description, image, url, type }) {
  useEffect(() => {
    const fullTitle = title || document.title
    const fullImage = image || window.location.origin + DEFAULT_IMAGE
    const fullUrl = url || window.location.href
    const fullType = type || 'website'

    if (title) {
      document.title = title
      setMeta('meta[property="og:title"]', 'content', title)
      setMeta('meta[name="twitter:title"]', 'content', title)
    }

    if (description) {
      setMeta('meta[name="description"]', 'content', description)
      setMeta('meta[property="og:description"]', 'content', description)
      setMeta('meta[name="twitter:description"]', 'content', description)
    }

    // Toujours renseigner image + url + type (dynamiques)
    setMeta('meta[property="og:image"]', 'content', fullImage)
    setMeta('meta[property="og:image:alt"]', 'content', fullTitle)
    setMeta('meta[name="twitter:image"]', 'content', fullImage)
    setMeta('meta[property="og:url"]', 'content', fullUrl)
    setMeta('meta[property="og:type"]', 'content', fullType)
    setMeta('meta[property="og:site_name"]', 'content', SITE_NAME)
    setCanonical(fullUrl)
  }, [title, description, image, url, type])

  return null
}

export default PageMeta
