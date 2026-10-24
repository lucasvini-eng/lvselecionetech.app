import * as mercadoLivre from './mercadoLivre.js'
import * as shopee from './shopee.js'

const HOSTS = {
  shopee: ['shopee.com.br', 'shope.ee'],
  'mercado-livre': ['mercadolivre.com.br', 'mercadolivre.com', 'mercadolibre.com', 'meli.la']
}
const SHORT = ['shope.ee', 's.shopee.com.br', 'meli.la']
const providers = { shopee, 'mercado-livre': mercadoLivre }

const match = (host, d) => host === d || host.endsWith('.' + d)

export function parseHttps(value) {
  try {
    const u = new URL(String(value).trim())
    return u.protocol === 'https:' ? u : null
  } catch {
    return null
  }
}

export function detectPlatform(value) {
  const u = parseHttps(value)
  if (!u) return null
  const host = u.hostname.toLowerCase()
  return Object.entries(HOSTS).find(([, ds]) => ds.some((d) => match(host, d)))?.[0] || null
}

export const isShort = (value) => {
  const u = parseHttps(value)
  return !!u && SHORT.some((d) => match(u.hostname.toLowerCase(), d))
}

const REQUIRED = ['title', 'image', 'price', 'description']

/**
 * Consulta uma fonte autorizada. NUNCA faz scraping de páginas.
 * Retorna sempre { platform, fields, missing, source, manualRequired, message }.
 */
export async function lookupProduct({ affiliateUrl, productUrl }) {
  const platform = detectPlatform(affiliateUrl)
  if (!platform) {
    const e = new Error('Link não reconhecido. Use um link https da Shopee ou do Mercado Livre.')
    e.status = 400
    throw e
  }

  const base = { platform, fields: {}, missing: REQUIRED, source: null, manualRequired: true }

  // Link curto sem a URL original do produto: não é possível consultar com segurança
  const target = productUrl && parseHttps(productUrl) && detectPlatform(productUrl) === platform ? productUrl : affiliateUrl
  if (isShort(target)) {
    return { ...base, message: 'Link encurtado: informe também a URL original do produto para consulta, ou preencha manualmente.' }
  }

  const provider = providers[platform]
  if (!provider.isConfigured()) {
    return { ...base, message: 'Credenciais da API desta plataforma não configuradas no servidor. Preencha manualmente.' }
  }

  try {
    const { fields, source } = await provider.lookup(target)
    const missing = REQUIRED.filter((k) => fields[k] === null || fields[k] === '' || fields[k] === undefined)
    return {
      platform,
      fields,
      missing,
      source,
      manualRequired: missing.length > 0,
      message: missing.length ? 'Alguns dados não estavam disponíveis. Complete manualmente.' : 'Dados obtidos. Revise antes de publicar.'
    }
  } catch (e) {
    console.error('[lookup]', e.message)
    return { ...base, message: 'Não foi possível consultar a fonte oficial agora. Preencha manualmente.' }
  }
}
