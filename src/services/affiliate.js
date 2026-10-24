import { PLATFORMS } from '../data/products'

/**
 * Domínios aceitos por plataforma (inclui encurtadores oficiais de afiliados).
 * Ajuste aqui caso as plataformas passem a usar outros domínios.
 */
const PLATFORM_HOSTS = {
  shopee: ['shopee.com.br', 'shope.ee'],
  'mercado-livre': ['mercadolivre.com.br', 'mercadolivre.com', 'mercadolibre.com', 'meli.la']
}

/** Hosts conhecidos de links encurtados: podem não ser consultáveis pela API. */
const SHORT_HOSTS = ['shope.ee', 's.shopee.com.br', 'meli.la']

function hostMatches(host, domain) {
  return host === domain || host.endsWith('.' + domain)
}

/** Interpreta a URL com segurança; retorna null se inválida ou não-HTTPS. */
export function parseUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    return url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

/** Detecta a plataforma pelo domínio. Retorna 'shopee', 'mercado-livre' ou null. */
export function detectPlatform(value) {
  const url = parseUrl(value)
  if (!url) return null
  const host = url.hostname.toLowerCase()
  for (const [platform, domains] of Object.entries(PLATFORM_HOSTS)) {
    if (domains.some((d) => hostMatches(host, d))) return platform
  }
  return null
}

export function isShortLink(value) {
  const url = parseUrl(value)
  return !!url && SHORT_HOSTS.some((d) => hostMatches(url.hostname.toLowerCase(), d))
}

/**
 * Valida um link de afiliado.
 * @returns {{ valid: boolean, platform: string|null, shortLink: boolean, error: string|null }}
 */
export function validateAffiliateUrl(value) {
  if (!value || !String(value).trim()) {
    return { valid: false, platform: null, shortLink: false, error: 'Informe o link de afiliado.' }
  }
  const url = parseUrl(value)
  if (!url) {
    return {
      valid: false,
      platform: null,
      shortLink: false,
      error: 'O link precisa ser uma URL válida começando com https://'
    }
  }
  const platform = detectPlatform(value)
  if (!platform) {
    return {
      valid: false,
      platform: null,
      shortLink: false,
      error: 'Link não reconhecido. Use um link da Shopee ou do Mercado Livre.'
    }
  }
  return { valid: true, platform, shortLink: isShortLink(value), error: null }
}

export function platformInfo(platformId) {
  return PLATFORMS[platformId] || { id: platformId, name: 'Loja parceira', buyLabel: 'Ver na loja' }
}

/** Link pronto para uso no botão: só retorna se for um link de afiliado válido. */
export function safeAffiliateHref(product) {
  return validateAffiliateUrl(product.affiliateUrl).valid ? product.affiliateUrl : null
}
