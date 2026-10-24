<script setup>
import { computed } from 'vue'
import { RotateCw, Heart } from 'lucide-vue-next'
import ProductImage from './ProductImage.vue'
import AffiliateBadge from './AffiliateBadge.vue'
import BuyButton from './BuyButton.vue'
import { formatPrice } from '../utils/format'

const props = defineProps({
  product: { type: Object, required: true },
  favorite: { type: Boolean, default: false }
})
const emit = defineEmits(['flip', 'toggle-favorite'])

const hasDiscount = computed(
  () => props.product.previousPrice && props.product.previousPrice > props.product.price
)
</script>

<template>
  <div class="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-navy-900/90 p-3 shadow-card">
    <div class="relative">
      <!-- Área informativa: gira o card (clique, toque, Enter ou Espaço) -->
      <div
        role="button"
        tabindex="0"
        class="block cursor-pointer rounded-xl"
        :aria-label="`Ver detalhes de ${product.title}`"
        @click="emit('flip')"
        @keydown.enter.prevent="emit('flip')"
        @keydown.space.prevent="emit('flip')"
      >
        <ProductImage :src="product.image" :alt="product.title" :category="product.category" />
      </div>

      <div class="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
        <AffiliateBadge :platform="product.platform" />
        <span
          v-if="product.demo"
          class="rounded-full bg-navy-950/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300 ring-1 ring-cyan-400/40"
          >Demonstração</span
        >
      </div>

      <button
        type="button"
        class="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-navy-950/70 text-silver-100 backdrop-blur transition hover:text-cyan-300"
        :aria-pressed="favorite"
        :aria-label="favorite ? `Remover ${product.title} dos favoritos` : `Favoritar ${product.title}`"
        @click="emit('toggle-favorite')"
      >
        <Heart class="h-5 w-5" :class="favorite ? 'fill-cyan-400 text-cyan-400' : ''" aria-hidden="true" />
      </button>
    </div>

    <div
      role="button"
      tabindex="0"
      class="flex flex-1 cursor-pointer flex-col gap-2 rounded-xl px-1"
      :aria-label="`Ver mais informações sobre ${product.title}`"
      @click="emit('flip')"
      @keydown.enter.prevent="emit('flip')"
      @keydown.space.prevent="emit('flip')"
    >
      <h3 class="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-silver-50">
        {{ product.title }}
      </h3>

      <div class="mt-auto">
        <p v-if="hasDiscount" class="text-xs text-silver-400 line-through">
          <span class="sr-only">Preço anterior:</span>{{ formatPrice(product.previousPrice) }}
        </p>
        <p class="font-display text-2xl font-bold text-white">
          <span class="sr-only">Preço atual:</span>{{ formatPrice(product.price) }}
        </p>
        <p class="mt-1 inline-flex items-center gap-1 text-xs text-cyan-300">
          <RotateCw class="h-3.5 w-3.5" aria-hidden="true" /> Toque para ver detalhes
        </p>
      </div>
    </div>

    <!-- Fora da área que gira: nunca dispara o flip -->
    <BuyButton :product="product" />
  </div>
</template>
