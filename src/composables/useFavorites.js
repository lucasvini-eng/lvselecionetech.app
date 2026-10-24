import { ref, computed } from 'vue'

const STORAGE_KEY = 'lvst:favorites'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Estado compartilhado entre componentes (módulo singleton)
const ids = ref(load())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.value))
  } catch {
    /* armazenamento indisponível: segue só em memória */
  }
}

export function useFavorites() {
  const count = computed(() => ids.value.length)
  const isFavorite = (id) => ids.value.includes(id)

  function toggle(id) {
    ids.value = isFavorite(id) ? ids.value.filter((x) => x !== id) : [...ids.value, id]
    persist()
  }

  return { favoriteIds: ids, count, isFavorite, toggle }
}
