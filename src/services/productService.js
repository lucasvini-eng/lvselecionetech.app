import { products as localProducts } from '../data/products'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const USE_API = import.meta.env.VITE_USE_API === 'true'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    /* resposta sem JSON */
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Erro ${res.status} ao consultar o servidor.`)
    err.status = res.status
    throw err
  }
  return data
}

/**
 * Lista os produtos da vitrine.
 * - VITE_USE_API=true  -> GET /api/products (backend)
 * - caso contrário      -> src/data/products.js
 */
export async function fetchProducts() {
  if (USE_API) {
    try {
      const data = await request('/api/products')
      const list = Array.isArray(data?.products) ? data.products : []
      return list.length ? list : localProducts
    } catch {
      return localProducts
    }
  }
  return localProducts
}

/**
 * Pré-preenche o cadastro a partir de um link de afiliado.
 * O backend consulta SOMENTE fontes autorizadas (API oficial / provider configurado).
 * Retorna { platform, fields, missing, source, manualRequired, message }.
 */
export function lookupAffiliateLink(url) {
  return request('/api/products/lookup', {
    method: 'POST',
    body: JSON.stringify({ url })
  })
}
