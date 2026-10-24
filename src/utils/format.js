const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Formata preço em reais; retorna um texto neutro se o preço não estiver disponível. */
export function formatPrice(value) {
  return typeof value === 'number' && Number.isFinite(value) ? brl.format(value) : 'Ver na loja'
}
