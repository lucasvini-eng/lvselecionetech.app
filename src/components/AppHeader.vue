<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Menu, X, Heart } from 'lucide-vue-next'
import { CATEGORIES } from '../data/products'
import ProductSearch from './ProductSearch.vue'

const props = defineProps({
  query: { type: String, default: '' },
  favoritesCount: { type: Number, default: 0 },
  showingFavorites: { type: Boolean, default: false }
})
const emit = defineEmits(['update:query', 'toggle-favorites', 'go-home'])

const open = ref(false)
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 8
}
function onKey(e) {
  if (e.key === 'Escape') open.value = false
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
})

// Trava a rolagem do fundo quando o menu lateral está aberto
watch(open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-40 border-b transition-colors"
    :class="scrolled ? 'border-white/10 bg-navy-950/90 backdrop-blur-md' : 'border-transparent bg-navy-950/60 backdrop-blur-sm'"
  >
    <a
      href="#conteudo"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded-lg focus:bg-cyan-400 focus:px-3 focus:py-2 focus:text-navy-950"
      >Pular para o conteúdo</a
    >

    <div class="container-page flex h-16 items-center gap-3 lg:gap-6">
      <!-- Logo -->
      <a
        href="/"
        class="flex shrink-0 items-center gap-2 rounded-lg"
        aria-label="LVSelecioneTech — página inicial"
        @click.prevent="emit('go-home')"
      >
        <img
          src="/logo-256.webp"
          alt=""
          width="44"
          height="44"
          class="h-11 w-11 rounded-full"
          decoding="async"
        />
        <span class="hidden font-display text-lg font-bold tracking-tight sm:block 2xl:block">
          <span class="gradient-text">LVS</span><span class="text-silver-50">elecione</span><span class="text-cyan-400">Tech</span>
        </span>
      </a>

      <!-- Navegação desktop -->
      <nav class="hidden min-w-0 flex-1 xl:block" aria-label="Categorias">
        <ul class="flex items-center justify-center gap-0.5">
          <li v-for="cat in CATEGORIES" :key="cat.id">
            <a
              :href="`#${cat.id}`"
              class="whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-medium text-silver-200 transition hover:bg-white/10 hover:text-cyan-300"
              >{{ cat.name }}</a
            >
          </li>
        </ul>
      </nav>

      <div class="ml-auto hidden w-full max-w-xs md:block xl:max-w-[12rem] 2xl:max-w-[16rem]">
        <ProductSearch
          :model-value="query"
          input-id="busca-header"
          placeholder="Buscar produtos…"
          @update:model-value="emit('update:query', $event)"
        />
      </div>

      <!-- Favoritos -->
      <button
        type="button"
        class="relative ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition hover:border-cyan-400/60 md:ml-0"
        :class="showingFavorites ? 'text-cyan-300 border-cyan-400/60' : 'text-silver-100'"
        :aria-pressed="showingFavorites"
        :aria-label="`Favoritos (${favoritesCount})`"
        @click="emit('toggle-favorites')"
      >
        <Heart class="h-5 w-5" :class="showingFavorites ? 'fill-cyan-400/40' : ''" aria-hidden="true" />
        <span
          v-if="favoritesCount"
          class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-cyan-400 px-1 text-[11px] font-bold text-navy-950"
          >{{ favoritesCount }}</span
        >
      </button>

      <!-- Botão menu móvel -->
      <button
        type="button"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 xl:hidden"
        :aria-expanded="open"
        aria-controls="menu-movel"
        aria-label="Abrir menu de categorias"
        @click="open = true"
      >
        <Menu class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  </header>

  <!-- Menu lateral (mobile/tablet) -->
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 xl:hidden" @click.self="open = false">
      <div class="absolute inset-0 bg-navy-950/70 backdrop-blur-sm" @click="open = false" aria-hidden="true"></div>
      <aside
        id="menu-movel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de categorias"
        class="absolute right-0 top-0 flex h-full w-[84%] max-w-sm flex-col gap-5 border-l border-white/10 bg-navy-900 p-5 shadow-card"
      >
        <div class="flex items-center justify-between">
          <span class="font-display text-lg font-bold"><span class="gradient-text">LVS</span>elecione<span class="text-cyan-400">Tech</span></span>
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10"
            aria-label="Fechar menu"
            @click="open = false"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <ProductSearch
          :model-value="query"
          input-id="busca-movel"
          placeholder="Buscar produtos…"
          @update:model-value="emit('update:query', $event)"
          @submit="open = false"
        />

        <nav aria-label="Categorias" class="overflow-y-auto">
          <ul class="space-y-1">
            <li v-for="cat in CATEGORIES" :key="cat.id">
              <a
                :href="`#${cat.id}`"
                class="block rounded-xl px-3 py-3 text-base font-medium text-silver-100 hover:bg-white/10 hover:text-cyan-300"
                @click="open = false"
                >{{ cat.name }}</a
              >
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  </Transition>
</template>
