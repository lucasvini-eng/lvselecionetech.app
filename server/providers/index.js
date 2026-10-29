import * as mercadoLivre from './mercadoLivre.js'
import * as shopee from './shopee.js'

const HOSTS = {
  shopee: ['shopee.com.br', 'shope.ee', 's.shopee.com.br', 'shp.ee', 'br.shp.ee'],
  'mercado-livre': ['mercadolivre.com.br', 'mercadolivre.com', 'mercadolibre.com', 'meli.la', 'produto.mercadolivre.com.br']
}
const SHORT = ['shope.ee', 's.shopee.com.br', 'shp.ee', 'br.shp.ee', 'meli.la']
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
 * Consulta a plataforma (Shopee ou Mercado Livre) para extrair os dados do produto.
 * Suporta links normais, links de afiliados e links encurtados.
 * Retorna { platform, fields, missing, source, manualRequired, message }.
 */
export async function lookupProduct({ affiliateUrl, productUrl }) {
  const platform = detectPlatform(affiliateUrl) || (productUrl && detectPlatform(productUrl))
  if (!platform) {
    const e = new Error('Link não reconhecido. Use um link https da Shopee ou do Mercado Livre.')
    e.status = 400
    throw e
  }

  const base = { platform, fields: {}, missing: REQUIRED, source: null, manualRequired: true }
  const target = productUrl && parseHttps(productUrl) && detectPlatform(productUrl) === platform ? productUrl : affiliateUrl
  const provider = providers[platform]

  if (!provider) {
    const e = new Error(`Plataforma ${platform} não suportada.`)
    e.status = 400
    throw e
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
      message: missing.length
        ? 'Dados obtidos com sucesso! Preencha ou revise os campos restantes.'
        : 'Informações puxadas com sucesso! Revise antes de publicar.'
    }
  } catch (e) {
    console.error('[lookup erro]:', e.message)
    return {
      ...base,
      message: `Não foi possível puxar automaticamente (${e.message}). Você pode preencher manualmente.`
    }
  }
}
