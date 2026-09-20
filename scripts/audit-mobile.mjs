import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const WIDTHS = [320, 375, 390, 430] // iPhone SE, 12, 14, Pro Max
const PAGES = [
  { name: 'accueil', path: '/' },
  { name: 'annonces', path: '/annonces' },
  { name: 'detail-annonce', path: '/annonce/8b9ede5b-6ef9-4128-b42e-8b3ce73b69cc' },
  { name: 'connexion', path: '/connexion' },
  { name: 'inscription', path: '/inscription' },
  { name: 'profil', path: '/profil' },
  { name: 'messages', path: '/messages' },
  { name: 'notifications', path: '/notifications' },
  { name: 'mes-annonces', path: '/mes-annonces' },
  { name: 'mes-commandes', path: '/mes-commandes' },
  { name: 'favoris', path: '/favoris' },
  { name: 'parametres', path: '/parametres' },
  { name: 'vendre', path: '/vendre' },
]

const SCREENSHOT_DIR = join(process.cwd(), 'audit-screenshots')
mkdirSync(SCREENSHOT_DIR, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

const report = []

for (const pageConf of PAGES) {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 })

    const url = BASE_URL + pageConf.path
    let issue = null

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
      await page.waitForTimeout(800)

      // Verifier si scroll horizontal
      const overflowData = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth
        const winWidth = window.innerWidth
        const hasOverflow = docWidth > winWidth + 2 // tolerance 2px

        // Trouver les elements qui debordent
        const overflowing = []
        if (hasOverflow) {
          const all = document.querySelectorAll('*')
          for (const el of all) {
            const rect = el.getBoundingClientRect()
            if (rect.right > winWidth + 2 || rect.left < -2) {
              overflowing.push({
                tag: el.tagName.toLowerCase(),
                class: el.className?.toString().slice(0, 80) || '',
                id: el.id || '',
                right: Math.round(rect.right),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
              })
            }
          }
        }

        return {
          docWidth,
          winWidth,
          overflow: hasOverflow,
          overflowing: overflowing.slice(0, 10), // top 10
        }
      })

      if (overflowData.overflow) {
        issue = {
          type: 'HORIZONTAL_SCROLL',
          docWidth: overflowData.docWidth,
          winWidth: overflowData.winWidth,
          overflowAmount: overflowData.docWidth - overflowData.winWidth,
          elements: overflowData.overflowing,
        }
      }

      // Screenshot
      const screenshotName = `${pageConf.name}-${width}.png`
      await page.screenshot({
        path: join(SCREENSHOT_DIR, screenshotName),
        fullPage: false,
      })
    } catch (err) {
      issue = { type: 'ERROR', message: err.message }
    }

    report.push({
      page: pageConf.name,
      path: pageConf.path,
      width,
      issue,
    })

    // Afficher en temps reel
    const status = issue
      ? issue.type === 'HORIZONTAL_SCROLL'
        ? `❌ DEBORDEMENT +${issue.overflowAmount}px`
        : `❌ ERREUR: ${issue.message}`
      : '✅ OK'
    console.log(`${status.padEnd(30)} ${pageConf.name.padEnd(20)} ${width}px`)
  }
}

await browser.close()

// Rapport final
console.log('\n' + '='.repeat(70))
console.log('RAPPORT D AUDIT MOBILE')
console.log('='.repeat(70))

const problems = report.filter((r) => r.issue)

if (problems.length === 0) {
  console.log('\n✅ AUCUN PROBLEME DETECTE\n')
} else {
  console.log(`\n❌ ${problems.length} PROBLEME(S) DETECTE(S)\n`)

  for (const p of problems) {
    console.log(`\n📍 ${p.page} (${p.path}) @ ${p.width}px`)
    if (p.issue.type === 'HORIZONTAL_SCROLL') {
      console.log(`   Type: DEBORDEMENT HORIZONTAL`)
      console.log(`   Largeur page: ${p.issue.docWidth}px (viewport: ${p.issue.winWidth}px)`)
      console.log(`   Debordement: +${p.issue.overflowAmount}px`)
      console.log(`   Elements qui debordent:`)
      for (const el of p.issue.elements) {
        console.log(`     - <${el.tag} class="${el.class}"> right=${el.right}px width=${el.width}px`)
      }
    } else {
      console.log(`   Type: ERREUR`)
      console.log(`   Message: ${p.issue.message}`)
    }
  }
}

console.log(`\n📸 Screenshots dans : ${SCREENSHOT_DIR}`)
console.log('')
