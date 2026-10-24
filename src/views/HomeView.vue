<script setup>
import { computed, ref, nextTick } from 'vue'
import { SearchX, ArrowLeft, Heart } from 'lucide-vue-next'
import AppHeader from '../components/AppHeader.vue'
import HeroSection from '../components/HeroSection.vue'
import CategoryNavigation from '../components/CategoryNavigation.vue'
import CategorySection from '../components/CategorySection.vue'
import ProductGrid from '../components/ProductGrid.vue'
import LoadingState from '../components/LoadingState.vue'
import FeedbackForm from '../components/FeedbackForm.vue'
import AppFooter from '../components/AppFooter.vue'
import { useProducts } from '../composables/useProducts'
import { useProductSearch } from '../composables/useProductSearch'
import { useFavorites } from '../composables/useFavorites'

const { products, categories, categoryName, loading, error, reload } = useProducts()
const { query, isSearching, results, clear } = useProductSearch(products)
const { favoriteIds, count: favCount } = useFavorites()

const showFavorites = ref(false)

const favoriteProducts = computed(() => products.value.filter((p) => favoriteIds.value.includes(p.id)))

// Resultados agrupados por categoria (exibe a categoria de cada resultado)
const groupedResults = computed(() => {
  const groups = new Map()
  for (const p of results.value) {
    if (!groups.has(p.category)) groups.set(p.category, [])
    groups.get(p.category).push(p)
  }
  return [...groups.entries()].map(([id, items]) => ({ id, name: categoryName(id), items }))
})

const inSpecialView = computed(() => isSearching.value || showFavorites.value)

function onQuery(value) {
  query.value = value
  if (value.trim()) showFavorites.value = false
}

async function focusResults() {
  await nextTick()
  document.getElementById('resultados')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start'
  })
}

function backToAll() {
  clear()
  showFavorites.value = false
  nextTick(() => window.scrollTo({ top: 0 }))
}

function toggleFavorites() {
  clear()
  showFavorites.value = !showFavorites.value
  if (showFavorites.value) focusResults()
}

function seeMore(cat) {
  query.value = cat.name
  focusResults()
}
</script>

<template>
  <AppHeader
    :query="query"
    :favorites-count="favCount"
    :showing-favorites="showFavorites"
    @update:query="onQuery"
    @toggle-favorites="toggleFavorites"
    @go-home="backToAll"
  />

  <main id="conteudo">
    <HeroSection :query="query" @update:query="onQuery" @search="focusResults" />

    <div class="pb-6">
      <CategoryNavigation />
    </div>

    <!-- Estado de busca / favoritos -->
    <section v-if="inSpecialView" id="resultados" class="scroll-mt-24 py-10" aria-live="polite">
      <div class="container-page">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 class="font-display text-2xl font-bold text-white">
            <template v-if="isSearching">
              {{ results.length }} {{ results.length === 1 ? 'resultado' : 'resultados' }} para
              <span class="gradient-text">“{{ query.trim() }}”</span>
            </template>
            <template v-else>
              <Heart class="mr-2 inline h-6 w-6 text-cyan-400" aria-hidden="true" />Seus favoritos
            </template>
          </h2>
          <div class="flex gap-2">
            <button v-if="isSearching" type="button" class="btn-ghost" @click="clear">Limpar pesquisa</button>
            <button type="button" class="btn-primary" @click="backToAll">
              <ArrowLeft class="h-4 w-4" aria-hidden="true" /> Ver todas as categorias
            </button>
          </div>
        </div>

        <LoadingState v-if="loading || error" :error="error" @retry="reload" />

        <!-- Busca -->
        <template v-else-if="isSearching">
          <div v-if="!results.length" class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 p-12 text-center">
            <SearchX class="h-10 w-10 text-cyan-400" aria-hidden="true" />
            <p class="text-lg font-semibold text-white">Nenhum produto encontrado</p>
            <p class="max-w-md text-sm text-silver-400">
              Tente outro termo (por exemplo, “teclado”, “mouse” ou “27 polegadas”) ou volte para ver todas as categorias.
            </p>
          </div>
          <template v-else>
            <div v-for="g in groupedResults" :key="g.id" class="mb-8">
              <h3 class="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-300">{{ g.name }}</h3>
              <ProductGrid :products="g.items" />
            </div>
          </template>
        </template>

        <!-- Favoritos -->
        <template v-else>
          <div v-if="!favoriteProducts.length" class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 p-12 text-center">
            <Heart class="h-10 w-10 text-cyan-400" aria-hidden="true" />
            <p class="text-lg font-semibold text-white">Você ainda não favoritou nenhum produto</p>
            <p class="text-sm text-silver-400">Toque no coração de um card para salvar aqui (guardado só neste navegador).</p>
          </div>
          <ProductGrid v-else :products="favoriteProducts" />
        </template>
      </div>
    </section>

    <!-- Vitrine normal -->
    <template v-else>
      <div v-if="loading || error" class="container-page py-10">
        <LoadingState :error="error" :count="4" @retry="reload" />
      </div>
      <template v-else>
        <CategorySection v-for="cat in categories" :key="cat.id" :category="cat" @see-more="seeMore" />
      </template>

      <p class="container-page pb-4 pt-2 text-center text-xs text-silver-400">
        Ao clicar em “Comprar” você será levado à Shopee ou ao Mercado Livre. Podemos receber comissão pelas compras feitas pelos
        nossos links, sem custo adicional para você.
      </p>
    </template>

    <FeedbackForm />
  </main>

  <AppFooter />
</template>
