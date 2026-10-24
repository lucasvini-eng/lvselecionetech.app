/**
 * Provider Mercado Livre — usa a API OFICIAL (api.mercadolibre.com).
 *
 * Requer um aplicativo registrado em https://developers.mercadolivre.com.br
 * com ML_CLIENT_ID e ML_CLIENT_SECRET no .env do servidor (nunca no frontend).
 *
 * Observação: a disponibilidade de campos/endpoints depende das permissões do seu
 * aplicativo e pode mudar. Confira a documentação oficial atual. Em qualquer falha,
 * o fluxo cai no cadastro manual.
 */

const API = 'https://api.mercadolibre.com'
let cached = { token: null, expiresAt: 0 }

export function isConfigured() {
  return Boolean(process.env.ML_CLIENT_ID && process.env.ML_CLIENT_SECRET)
}

/** Extrai o ID do anúncio (ex.: MLB123456789) de uma URL do Mercado Livre. */
export function extractItemId(url) {
  const m = String(url).match(/ML[A-Z]-?(\d{6,})/i)
  if (!m) return null
  const site = String(url).match(/(ML[A-Z])-?\d{6,}/i)[1].toUpperCase()
  return { id: `${site}${m[1]}`, isCatalog: /\/p\/ML[A-Z]\d+/i.test(url) }
}

async function getToken() {
  if (cached.token && Date.now() < cached.expiresAt - 60_000) return cached.token
  const res = await fetch(`${API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET
    })
  })
  if (!res.ok) throw new Error(`Falha na autenticação com o Mercado Livre (HTTP ${res.status}).`)
  const data = await res.json()
  cached = { token: data.access_token, expiresAt: Date.now() + (data.expires_in || 21_600) * 1000 }
  return cached.token
}

async function api(path, token) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Mercado Livre respondeu HTTP ${res.status} em ${path}.`)
  return res.json()
}

/** @returns {Promise<{fields: object, source: string}>} */
export async function lookup(productUrl) {
  const ref = extractItemId(productUrl)
  if (!ref) throw new Error('Não foi possível identificar o ID do anúncio na URL do Mercado Livre.')

  const token = await getToken()
  const item = await api(`/items/${ref.id}`, token)

  let description = ''
  try {
    const d = await api(`/items/${ref.id}/description`, token)
    description = d?.plain_text || ''
  } catch {
    /* descrição é opcional */
  }

  const attrs = Array.isArray(item.attributes) ? item.attributes : []
  const brand = attrs.find((a) => a.id === 'BRAND')?.value_name || ''
  const features = attrs
    .filter((a) => a.value_name && a.id !== 'BRAND')
    .slice(0, 8)
    .map((a) => `${a.name}: ${a.value_name}`)

  const picture = item.pictures?.[0]?.secure_url || item.thumbnail || ''

  return {
    source: 'mercadolivre-api',
    fields: {
      title: item.title || '',
      brand,
      image: picture.replace(/^http:\/\//, 'https://'),
      price: typeof item.price === 'number' ? item.price : null,
      previousPrice: typeof item.original_price === 'number' ? item.original_price : null,
      description: description.slice(0, 600),
      features
    }
  }
}
