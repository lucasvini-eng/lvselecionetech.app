import crypto from 'node:crypto'
import { fetchHtmlWithRedirects, extractProductFromHtml, parsePrice, inferCategory } from '../lib/scraper.js'

const ENDPOINT = process.env.SHOPEE_API_URL || 'https://open-api.affiliate.shopee.com.br/graphql'

export function isConfigured() {
  // Retorna true sempre, pois temos suporte a consulta web/scraper direto
  return true
}

export function hasApiCredentials() {
  return Boolean(process.env.SHOPEE_APP_ID && process.env.SHOPEE_APP_SECRET)
}

/** Extrai shopId e itemId de URLs como .../produto-i.{shopId}.{itemId} ou /product/{shopId}/{itemId}. */
export function extractIds(url) {
  const s = String(url)
  const a = s.match(/-i\.(\d+)\.(\d+)/)
  if (a) return { shopId: a[1], itemId: a[2] }
  const b = s.match(/\/product\/(\d+)\/(\d+)/)
  if (b) return { shopId: b[1], itemId: b[2] }
  return null
}

function authHeader(payload) {
  const appId = process.env.SHOPEE_APP_ID
  const secret = process.env.SHOPEE_APP_SECRET
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = crypto.createHash('sha256').update(`${appId}${timestamp}${payload}${secret}`).digest('hex')
  return `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`
}

async function lookupViaOfficialApi(ids) {
  const query = `{ productOfferV2(itemId: ${Number(ids.itemId)}, shopId: ${Number(ids.shopId)}, limit: 1) { nodes { productName imageUrl priceMin priceMax shopName } } }`
  const payload = JSON.stringify({ query })

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader(payload) },
    body: payload
  })
  if (!res.ok) throw new Error(`Shopee API respondeu HTTP ${res.status}.`)
  const data = await res.json()
  if (data.errors?.length) throw new Error('A API da Shopee retornou erro.')

  const node = data?.data?.productOfferV2?.nodes?.[0]
  if (!node) throw new Error('Produto não encontrado na API da Shopee.')

  const price = Number(node.priceMin)
  const previousPrice = Number(node.priceMax) && Number(node.priceMax) > price ? Number(node.priceMax) : null

  const title = node.productName || ''
  return {
    source: 'shopee-affiliate-api',
    fields: {
      title,
      brand: node.shopName || '',
      image: node.imageUrl || '',
      price: Number.isFinite(price) ? price : null,
      previousPrice,
      description: '',
      features: node.shopName ? [`Loja: ${node.shopName}`] : [],
      suggestedCategory: inferCategory(title)
    }
  }
}

async function lookupViaScraper(url) {
  const { finalUrl, html } = await fetchHtmlWithRedirects(url)
  if (!html) throw new Error('Não foi possível obter os dados da página da Shopee.')

  const data = extractProductFromHtml(html, finalUrl)

  // Fallback de preço para Shopee se não encontrado no JSON-LD
  if (data.price === null) {
    // Procura padrões de preço no HTML
    const priceMatch = html.match(/class=["'][^"']*pqTWkA[^"']*["']>([^<]+)<\//i) ||
      html.match(/"price":\s*(\d+(\.\d+)?)/i) ||
      html.match(/"current_price":\s*(\d+(\.\d+)?)/i)

    if (priceMatch && priceMatch[1]) {
      data.price = parsePrice(priceMatch[1])
    }
  }

  return {
    source: 'shopee-web',
    fields: data
  }
}

export async function lookup(productUrl) {
  // 1. Desencurtar e expandir o link se for shope.ee ou s.shopee ou shp.ee
  let targetUrl = productUrl
  const isShortLink = /shope\.ee|s\.shopee\.com\.br|shp\.ee|br\.shp\.ee/i.test(productUrl)

  if (isShortLink) {
    try {
      const redirected = await fetchHtmlWithRedirects(productUrl, 4)
      if (redirected.finalUrl) targetUrl = redirected.finalUrl
      // Se já temos o HTML carregado e dados extraídos, podemos aproveitar direto!
      if (redirected.html) {
        const data = extractProductFromHtml(redirected.html, redirected.finalUrl)
        if (data.title || data.image) {
          return { source: 'shopee-web', fields: data }
        }
      }
    } catch (e) {
      console.warn('[Shopee redirect falhou]:', e.message)
    }
  }

  // 2. Se tiver credenciais de API oficial e conseguir extrair os IDs
  if (hasApiCredentials()) {
    const ids = extractIds(targetUrl)
    if (ids) {
      try {
        return await lookupViaOfficialApi(ids)
      } catch (e) {
        console.warn('[Shopee API falhou, tentando scraper]:', e.message)
      }
    }
  }

  // 3. Consulta via Web Scraper (Open Graph / JSON-LD / HTML)
  try {
    return await lookupViaScraper(targetUrl)
  } catch (e) {
    return {
      source: 'shopee-fallback',
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
