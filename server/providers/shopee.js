import crypto from 'node:crypto'

/**
 * Provider Shopee — usa a Shopee Affiliate Open API (GraphQL), que exige credenciais
 * do programa de afiliados: SHOPEE_APP_ID e SHOPEE_APP_SECRET (no .env do servidor).
 *
 * ATENÇÃO: este provider NÃO foi testado contra a API real (depende das suas credenciais).
 * Nomes de campos, endpoint e regras de assinatura devem ser conferidos na documentação
 * oficial vigente do programa. Se algo falhar, o fluxo cai no cadastro manual.
 */

const ENDPOINT = process.env.SHOPEE_API_URL || 'https://open-api.affiliate.shopee.com.br/graphql'

export function isConfigured() {
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

export async function lookup(productUrl) {
  const ids = extractIds(productUrl)
  if (!ids) throw new Error('Não foi possível identificar shopId/itemId na URL da Shopee.')

  const query = `{ productOfferV2(itemId: ${Number(ids.itemId)}, shopId: ${Number(ids.shopId)}, limit: 1) { nodes { productName imageUrl priceMin priceMax shopName } } }`
  const payload = JSON.stringify({ query })

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader(payload) },
    body: payload
  })
  if (!res.ok) throw new Error(`Shopee respondeu HTTP ${res.status}.`)
  const data = await res.json()
  if (data.errors?.length) throw new Error('A API da Shopee retornou erro. Verifique credenciais e permissões.')

  const node = data?.data?.productOfferV2?.nodes?.[0]
  if (!node) throw new Error('Produto não encontrado na API da Shopee.')

  const price = Number(node.priceMin)
  return {
    source: 'shopee-affiliate-api',
    fields: {
      title: node.productName || '',
      brand: '',
      image: node.imageUrl || '',
      price: Number.isFinite(price) ? price : null,
      previousPrice: null,
      description: '',
      features: []
    }
  }
}
