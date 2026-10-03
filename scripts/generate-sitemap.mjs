/**
 * Genere public/sitemap.xml dynamiquement a chaque build.
 * Utilise fetch natif sur l'API REST Supabase (pas de SDK)
 * pour eviter les problemes de WebSocket sur Node 20.
 * Ne casse JAMAIS le build : exit(0) en cas d'erreur.
 */

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SITE_URL = 'https://afrya-market.onrender.com'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[sitemap] VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY manquant.'
  )
  console.warn('[sitemap] Sitemap non regenere (le fichier actuel est conserve).')
  process.exit(0)
}

const STATIC_PAGES = [
  { path: '/',                    freq: 'daily',   priority: '1.0' },
  { path: '/annonces',            freq: 'hourly',  priority: '0.9' },
  { path: '/demandes',            freq: 'hourly',  priority: '0.9' },
  { path: '/categories',          freq: 'weekly',  priority: '0.8' },
  { path: '/je-recherche',        freq: 'monthly', priority: '0.7' },
  { path: '/a-propos',            freq: 'monthly', priority: '0.5' },
  { path: '/comment-ca-marche',   freq: 'monthly', priority: '0.5' },
  { path: '/aide',                freq: 'monthly', priority: '0.5' },
  { path: '/securite',            freq: 'monthly', priority: '0.5' },
  { path: '/contact',             freq: 'monthly', priority: '0.5' },
  { path: '/conditions',          freq: 'yearly',  priority: '0.3' },
  { path: '/confidentialite',     freq: 'yearly',  priority: '0.3' },
]

function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c])
  )
}

function fmtDate(d) {
  if (!d) return new Date().toISOString()
  return new Date(d).toISOString()
}

async function fetchTable(table, query) {
  const url = supabaseUrl + '/rest/v1/' + table + '?' + query
  const res = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': 'Bearer ' + supabaseKey,
      'Accept': 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      'HTTP ' + res.status + ' sur ' + table + ' : ' + text.slice(0, 200)
    )
  }
  return res.json()
}

async function main() {
  console.log('[sitemap] Generation en cours...')

  let listings = []
  let demands = []
  let profiles = []

  try {
    listings = await fetchTable(
      'listings',
      'select=id,created_at&status=eq.disponible&order=created_at.desc&limit=5000'
    )
  } catch (e) {
    console.error('[sitemap] Erreur listings :', e.message)
  }

  try {
    demands = await fetchTable(
      'demands',
      'select=id,created_at&status=eq.active&order=created_at.desc&limit=5000'
    )
  } catch (e) {
    console.error('[sitemap] Erreur demands :', e.message)
  }

  try {
    profiles = await fetchTable(
      'profiles_public',
      'select=id,created_at&limit=5000'
    )
  } catch (e) {
    console.error('[sitemap] Erreur profiles :', e.message)
  }

  const urls = []

  for (const p of STATIC_PAGES) {
    urls.push({
      loc: SITE_URL + p.path,
      lastmod: new Date().toISOString(),
      changefreq: p.freq,
      priority: p.priority,
    })
  }

  for (const l of listings || []) {
    urls.push({
      loc: SITE_URL + '/annonce/' + l.id,
      lastmod: fmtDate(l.created_at),
      changefreq: 'weekly',
      priority: '0.7',
    })
  }

  for (const d of demands || []) {
    urls.push({
      loc: SITE_URL + '/demandes/' + d.id,
      lastmod: fmtDate(d.created_at),
      changefreq: 'weekly',
      priority: '0.6',
    })
  }

  for (const p of profiles || []) {
    urls.push({
      loc: SITE_URL + '/vendeur/' + p.id,
      lastmod: fmtDate(p.created_at),
      changefreq: 'weekly',
      priority: '0.5',
    })
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          '  <url>\n' +
          '    <loc>' + escapeXml(u.loc) + '</loc>\n' +
          '    <lastmod>' + u.lastmod + '</lastmod>\n' +
          '    <changefreq>' + u.changefreq + '</changefreq>\n' +
          '    <priority>' + u.priority + '</priority>\n' +
          '  </url>'
      )
      .join('\n') +
    '\n</urlset>\n'

  const outPath = resolve('public', 'sitemap.xml')
  writeFileSync(outPath, xml, 'utf8')

  console.log(
    '[sitemap] OK : ' + urls.length + ' URLs ' +
    '(' + (listings || []).length + ' annonces, ' +
    (demands || []).length + ' demandes, ' +
    (profiles || []).length + ' vendeurs)'
  )
}

main().catch((err) => {
  console.error('[sitemap] Erreur inattendue :', err && err.message)
  process.exit(0)
})
