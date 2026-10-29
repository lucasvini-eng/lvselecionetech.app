const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const DEFAULT_HEADERS = {
  'User-Agent': BROWSER_UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache'
}

/**
 * Segue redirecionamentos (HTTP 301/302 e meta refresh) para expandir links encurtados
 * e obter a URL final e o HTML da página sem estourar erro 500.
 */
export async function fetchHtmlWithRedirects(startUrl, maxHops = 6) {
  let currentUrl = startUrl
  let hops = 0

  while (hops < maxHops) {
    hops++
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    try {
      const res = await fetch(currentUrl, {
        headers: DEFAULT_HEADERS,
        redirect: 'follow',
        signal: controller.signal
      })
      clearTimeout(timeout)

      const finalUrl = res.url || currentUrl
      let html = ''
      try {
        html = await res.text()
      } catch {
        html = ''
      }

      // Verifica se a página contém um redirecionamento por meta refresh
      const metaRefreshMatch = html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"';\s>]+)/i)
      if (metaRefreshMatch && metaRefreshMatch[1]) {
        let nextUrl = metaRefreshMatch[1].replace(/["']/g, '').trim()
        if (nextUrl.startsWith('/')) {
          const parsed = new URL(finalUrl)
          nextUrl = `${parsed.origin}${nextUrl}`
        }
        if (nextUrl.startsWith('http') && nextUrl !== currentUrl) {
          currentUrl = nextUrl
          continue
        }
      }

      return { finalUrl, html, status: res.status }
    } catch (e) {
      clearTimeout(timeout)
      return { finalUrl: currentUrl, html: '', error: e.message, status: 200 }
    }
  }

  return { finalUrl: currentUrl, html: '', status: 200 }
}

/**
 * Remove entidades HTML comuns e espaços extras.
 */
export function decodeHtmlEntities(str) {
  if (!str) return ''
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Converte string de preço (ex: "1.299,90", "R$ 499,00", "59.9") em número float.
 */
export function parsePrice(val) {
  if (typeof val === 'number') return Number.isFinite(val) ? val : null
  if (!val) return null
  const cleaned = String(val)
    .replace(/R\$\s*/gi, '')
    .trim()
  if (!cleaned) return null

  // Se tiver formato brasileiro com vírgula decimal: "1.299,90" -> 1299.90
  if (cleaned.includes(',')) {
    const normalized = cleaned.replace(/\./g, '').replace(',', '.')
    const num = parseFloat(normalized)
    return Number.isFinite(num) && num > 0 ? Number(num.toFixed(2)) : null
  }

  const num = parseFloat(cleaned)
  return Number.isFinite(num) && num > 0 ? Number(num.toFixed(2)) : null
}

/**
 * Extrai todas as tags <meta ...> do HTML em um dicionário normalizado.
 */
function extractMetaTags(html) {
  const tags = {}
  const regex = /<meta\s+([^>]+)>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const attrs = match[1]
    const propMatch = attrs.match(/(?:name|property|itemprop)=["']([^"']+)["']/i)
    const contentMatch = attrs.match(/content=["']([^"']*)["']/i)
    if (propMatch && contentMatch) {
      const key = propMatch[1].toLowerCase().trim()
      const val = decodeHtmlEntities(contentMatch[1])
      if (!tags[key]) tags[key] = val
    }
  }
  return tags
}

/**
 * Extrai blocos JSON-LD (<script type="application/ld+json">) e procura dados de Produto.
 */
function extractJsonLdProduct(html) {
  const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  const products = []

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const raw = match[1].trim()
      const parsed = JSON.parse(raw)
      const list = Array.isArray(parsed) ? parsed : (parsed['@graph'] || [parsed])
      for (const item of list) {
        if (!item) continue
        const type = String(item['@type'] || '').toLowerCase()
        if (type === 'product' || type.includes('product')) {
          products.push(item)
        }
      }
    } catch {
      // JSON inválido, ignora bloco
    }
  }

  return products[0] || null
}

/**
 * Sugere uma das 7 categorias a partir do título e descrição do produto.
 */
export function inferCategory(text) {
  const t = String(text || '').toLowerCase()
  if (/teclado|keyboard|keycap|switch\s+(red|blue|brown)/i.test(t)) return 'teclados'
  if (/mouse|trackball|mousepad/i.test(t)) return 'mouses'
  if (/monitor|display|ultrawide|ips\s+\d+hz|\d+["']\s*(led|lcd|curvo)/i.test(t)) return 'monitores'
  if (/fone|headset|headphone|earphone|earbuds|airpod|tws\s+bluetooth/i.test(t)) return 'fones-de-ouvido'
  if (/notebook|laptop|macbook|chromebook|ultrabook/i.test(t)) return 'notebooks'
  if (/cadeira\s*(gamer|escritório|office)/i.test(t)) return 'cadeiras-gamers'
  if (/pc\s*gamer|computador|desktop|gabinete|placa\s*de\s*vídeo|rtx|gtx|radeon|intel\s*core|ryzen/i.test(t)) return 'pcs'
  return ''
}

/**
 * Extrai dados do produto a partir do HTML usando JSON-LD, Open Graph e meta tags.
 */
export function extractProductFromHtml(html, pageUrl = '') {
  const meta = extractMetaTags(html)
  const jsonLd = extractJsonLdProduct(html)

  // 1. Título
  let title = ''
  if (jsonLd?.name) title = decodeHtmlEntities(jsonLd.name)
  if (!title && meta['og:title']) title = meta['og:title']
  if (!title && meta['twitter:title']) title = meta['twitter:title']
  if (!title) {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    if (titleMatch) title = decodeHtmlEntities(titleMatch[1])
  }
  // Limpar sufixos comuns de lojas
  title = title
    .replace(/\s*\|\s*(Mercado\s*Livre|Shopee\s*Brasil|Shopee|Frete\s*Grátis).*$/i, '')
    .replace(/\s*-\s*(Mercado\s*Livre|Shopee).*$/i, '')
    .trim()

  // 2. Imagem
  let image = ''
  if (jsonLd?.image) {
    if (Array.isArray(jsonLd.image)) {
      image = typeof jsonLd.image[0] === 'string' ? jsonLd.image[0] : jsonLd.image[0]?.url || ''
    } else if (typeof jsonLd.image === 'object') {
      image = jsonLd.image.url || ''
    } else if (typeof jsonLd.image === 'string') {
      image = jsonLd.image
    }
  }
  if (!image && meta['og:image']) image = meta['og:image']
  if (!image && meta['og:image:secure_url']) image = meta['og:image:secure_url']
  if (!image && meta['twitter:image']) image = meta['twitter:image']

  // Normalizar imagem https
  if (image && image.startsWith('http://')) {
    image = image.replace(/^http:\/\//, 'https://')
  }

  // 3. Preço e Preço Anterior
  let price = null
  let previousPrice = null

  if (jsonLd?.offers) {
    const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers
    if (offers) {
      price = parsePrice(offers.price || offers.lowPrice)
      if (offers.highPrice && parsePrice(offers.highPrice) > (price || 0)) {
        previousPrice = parsePrice(offers.highPrice)
      }
    }
  }

  if (!price && meta['product:price:amount']) price = parsePrice(meta['product:price:amount'])
  if (!price && meta['og:price:amount']) price = parsePrice(meta['og:price:amount'])

  // 4. Marca
  let brand = ''
  if (jsonLd?.brand) {
    brand = typeof jsonLd.brand === 'object' ? jsonLd.brand.name || '' : String(jsonLd.brand)
  }
  if (!brand && meta['product:brand']) brand = meta['product:brand']

  // 5. Descrição
  let description = ''
  if (jsonLd?.description) description = decodeHtmlEntities(jsonLd.description)
  if (!description && meta['og:description']) description = meta['og:description']
  if (!description && meta['twitter:description']) description = meta['twitter:description']
  if (!description && meta['description']) description = meta['description']

  description = description
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600)

  // 6. Características (se disponíveis)
  const features = []
  if (brand) features.push(`Marca: ${brand}`)

  const suggestedCategory = inferCategory(`${title} ${description}`)

  return {
    title,
    image,
    price,
    previousPrice,
    brand,
    description,
    features,
    suggestedCategory
  }
}
