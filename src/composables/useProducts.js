import { ref, computed, onMounted } from 'vue'
import { CATEGORIES } from '../data/products'
import { fetchProducts } from '../services/productService'

/**
 * Carrega os produtos e os agrupa por categoria.
 * Os componentes visuais não conhecem a origem dos dados.
 */
export function useProducts() {
  const all = ref([])
  const loading = ref(true)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      all.value = await fetchProducts()
    } catch (e) {
      error.value = e.message || 'Não foi possível carregar os produtos.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  const activeProducts = computed(() => all.value.filter((p) => p.active !== false))

  const categories = computed(() =>
    CATEGORIES.map((cat) => ({
      ...cat,
      // até 4 itens por seção; menos de 4 exibe apenas os existentes
      products: activeProducts.value.filter((p) => p.category === cat.id).slice(0, 4),
      total: activeProducts.value.filter((p) => p.category === cat.id).length
    }))
  )

  const categoryName = (id) => CATEGORIES.find((c) => c.id === id)?.name || id

  return { products: activeProducts, categories, categoryName, loading, error, reload: load }
}
