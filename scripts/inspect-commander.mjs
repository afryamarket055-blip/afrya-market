import { chromium } from 'playwright'

const URL = process.argv[2] || 'http://localhost:5173/annonces'
const WIDTH = 375

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: WIDTH, height: 800 } })

await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(2500)

const data = await page.evaluate(() => {
  const container = document.querySelector('.details-actions')

  if (!container) {
    // Fallback : chercher tout element avec classe contenant 'details-actions' ou 'actions'
    const all = document.querySelectorAll('[class*="actions"]')
    const found = []
    for (const el of all) {
      found.push({ tag: el.tagName, classes: el.className })
    }
    return {
      error: 'NO_DETAILS_ACTIONS',
      url: window.location.href,
      bodyClasses: document.body.className,
      possibleContainers: found,
      buttonsOnPage: Array.from(document.querySelectorAll('button, a.btn')).map((b) => ({
        tag: b.tagName,
        classes: b.className,
        text: b.textContent?.trim().slice(0, 40),
      })),
    }
  }

  function dump(el) {
    const cs = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    return {
      tag: el.tagName,
      classes: el.className,
      text: el.textContent?.trim().slice(0, 40),
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      styles: {
        display: cs.display,
        flex: cs.flex,
        flexGrow: cs.flexGrow,
        flexShrink: cs.flexShrink,
        flexBasis: cs.flexBasis,
        flexDirection: cs.flexDirection,
        alignItems: cs.alignItems,
        alignSelf: cs.alignSelf,
        justifyContent: cs.justifyContent,
        width: cs.width,
        height: cs.height,
        minWidth: cs.minWidth,
        minHeight: cs.minHeight,
        maxWidth: cs.maxWidth,
        maxHeight: cs.maxHeight,
        padding: cs.padding,
        margin: cs.margin,
        borderRadius: cs.borderRadius,
        aspectRatio: cs.aspectRatio,
        boxSizing: cs.boxSizing,
        lineHeight: cs.lineHeight,
        fontSize: cs.fontSize,
        position: cs.position,
        overflow: cs.overflow,
      },
    }
  }

  // Dump le conteneur + tous ses enfants directs
  const children = Array.from(container.children).map(dump)

  return {
    url: window.location.href,
    container: dump(container),
    children: children,
    parentChain: (() => {
      const chain = []
      let cur = container.parentElement
      for (let i = 0; i < 3 && cur; i++) {
        chain.push(dump(cur))
        cur = cur.parentElement
      }
      return chain
    })(),
  }
})

console.log(JSON.stringify(data, null, 2))
await browser.close()
