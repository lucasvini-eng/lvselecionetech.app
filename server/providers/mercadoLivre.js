import { fetchHtmlWithRedirects, extractProductFromHtml, parsePrice, decodeHtmlEntities, inferCategory } from '../lib/scraper.js'

const API = 'https://api.mercadolibre.com'
let cached = { token: null, expiresAt: 0 }

/**
 * Retorna true pois o provider suporta tanto a API pública do Mercado Livre
 * quanto extração resiliente de metadados das páginas, além de credenciais caso configuradas.
 */
export function isConfigured() {
  return true
}

/**
 * Extrai o ID do anúncio (ex.: MLB123456789) de uma URL do Mercado Livre.
 */
export function extractItemId(url) {
  const s = String(url)
  // Trata formatos: /MLB-123456, MLB123456, /p/MLB12345
  const m = s.match(/(ML[A-Z])-?(\d{6,})/i)
  if (!m) return null
  return {
    id: `${m[1].toUpperCase()}${m[2]}`,
    raw: m[0],
    isCatalog: /\/p\/ML[A-Z]\d+/i.test(s)
  }
}

async function getOAuthToken() {
  if (!process.env.ML_CLIENT_ID || !process.env.ML_CLIENT_SECRET) return null
  if (cached.token && Date.now() < cached.expiresAt - 60_000) return cached.token

  try {
    const res = await fetch(`${API}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.ML_CLIENT_ID,
        client_secret: process.env.ML_CLIENT_SECRET
      })
    })
    if (!res.ok) return null
    const data = await res.json()
    cached = { token: data.access_token, expiresAt: Date.now() + (data.expires_in || 21_600) * 1000 }
    return cached.token
  } catch {
    return null
  }
}

/**
 * Consulta a API do Mercado Livre (com ou sem token OAuth).
 */
async function fetchMercadoLivreApi(path) {
  const token = await getOAuthToken()
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API}${path}`, { headers })
  if (!res.ok) throw new Error(`ML API status ${res.status}`)
  return res.json()
}

/**
 * Tenta buscar os dados do anúncio via API pública do Mercado Livre.
 */
async function lookupViaApi(itemId) {
  const item = await fetchMercadoLivreApi(`/items/${itemId}`)

  let description = ''
  try {
    const descData = await fetchMercadoLivreApi(`/items/${itemId}/description`)
    description = descData?.plain_text || ''
  } catch {
    /* descrição é opcional */
  }

  const attrs = Array.isArray(item.attributes) ? item.attributes : []
  const brandAttr = attrs.find((a) => a.id === 'BRAND')
  const brand = brandAttr?.value_name || ''

  const features = attrs
    .filter((a) => a.value_name && a.id !== 'BRAND')
    .slice(0, 8)
    .map((a) => `${a.name}: ${a.value_name}`)

  const picture = item.pictures?.[0]?.secure_url || item.thumbnail || ''

  const title = item.title || ''
  const price = typeof item.price === 'number' ? item.price : null
  const previousPrice = typeof item.original_price === 'number' ? item.original_price : null

  return {
    source: 'mercadolivre-api',
    fields: {
      title,
      brand,
      image: picture.replace(/^http:\/\//, 'https://'),
      price,
      previousPrice,
      description: description.slice(0, 600),
      features,
      suggestedCategory: inferCategory(`${title} ${description}`)
    }
  }
}

/**
 * Consulta via página HTML do Mercado Livre (scraper resiliente com metatags e JSON-LD).
 */
async function lookupViaScraper(url) {
  const { finalUrl, html } = await fetchHtmlWithRedirects(url)
  if (!html) throw new Error('Não foi possível obter a página do Mercado Livre.')

  const data = extractProductFromHtml(html, finalUrl)

  // Fallback para preço específico no HTML do Mercado Livre caso meta tags não tragam
  if (data.price === null) {
    const priceMatch = html.match(/class=["'][^"']*andes-money-amount__fraction[^"']*["']>([^<]+)<\//i)
    if (priceMatch) {
      data.price = parsePrice(priceMatch[1])
    }
  }

  // Fallback para preço anterior no HTML do Mercado Livre
  if (data.previousPrice === null) {
    const prevMatch = html.match(/class=["'][^"']*andes-money-amount--previous[^"']*[\s\S]*?class=["'][^"']*andes-money-amount__fraction[^"']*["']>([^<]+)<\//i)
    if (prevMatch) {
      data.previousPrice = parsePrice(prevMatch[1])
    }
  }

  return {
    source: 'mercadolivre-web',
    fields: data
  }
}

/**
 * Puxa todas as informações do produto do Mercado Livre a partir do link.
 */
export async function lookup(productUrl) {
  // 1. Desencurta/expande o link se necessário
  let resolvedUrl = productUrl
  if (productUrl.includes('meli.la') || productUrl.includes('/sec/')) {
    try {
      const redirected = await fetchHtmlWithRedirects(productUrl, 3)
      if (redirected.finalUrl) resolvedUrl = redirected.finalUrl
    } catch {
      // continua com a URL original
    }
  }

  // 2. Tenta extrair o itemId
  const ref = extractItemId(resolvedUrl)

  // 3. Se tiver ID do item e não for puramente catálogo, tenta a API primeiro
  if (ref && !ref.isCatalog) {
    try {
      return await lookupViaApi(ref.id)
    } catch (e) {
      console.warn(`[ML API lookup falhou para ${ref.id}, tentando scraper]:`, e.message)
    }
  }

  // 4. Se a API falhou ou é link de catálogo / página, usa o scraper
  try {
    return await lookupViaScraper(resolvedUrl)
  } catch (e) {
    if (ref && ref.isCatalog) {
      try {
        return await lookupViaApi(ref.id)
      } catch {
        /* ignora */
      }
    }
    return {
      source: 'mercadolivre-fallback',
      fields: {
        title: '',
        brand: '',
        image: '',
        price: null,
        previousPrice: null,
        description: '',
        features: []
      }
    }
  }
}
