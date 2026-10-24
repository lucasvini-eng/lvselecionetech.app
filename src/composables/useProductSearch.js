import { ref, computed, unref } from 'vue'
import { CATEGORIES } from '../data/products'

/** minúsculas, sem acentos, sem espaços duplicados */
export function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const categoryNames = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]))

function haystack(p) {
  return normalize(
    [p.title, p.brand, categoryNames[p.category], p.category, p.description, ...(p.features || [])].join(' ')
  )
}

/**
 * Busca dinâmica sobre a lista de produtos (ref ou array).
 * Todos os termos digitados precisam aparecer (AND), em qualquer ordem.
 */
export function useProductSearch(productsSource) {
  const query = ref('')

  const normalizedQuery = computed(() => normalize(query.value))
  const isSearching = computed(() => normalizedQuery.value.length > 0)

  const results = computed(() => {
    if (!isSearching.value) return []
    const terms = normalizedQuery.value.split(' ')
    return unref(productsSource).filter((p) => {
      const text = haystack(p)
      return terms.every((t) => text.includes(t))
    })
  })

  function clear() {
    query.value = ''
  }

  return { query, isSearching, results, clear }
}
