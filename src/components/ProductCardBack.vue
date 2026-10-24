<script setup>
import { Undo2, Check, Info } from 'lucide-vue-next'
import BuyButton from './BuyButton.vue'
import AffiliateBadge from './AffiliateBadge.vue'

defineProps({ product: { type: Object, required: true } })
const emit = defineEmits(['flip'])
</script>

<template>
  <div class="flex h-full flex-col gap-3 rounded-2xl border border-cyan-400/30 bg-navy-800/95 p-4 shadow-card">
    <div class="flex items-start justify-between gap-2">
      <AffiliateBadge :platform="product.platform" />
      <button
        type="button"
        class="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-cyan-300 hover:bg-white/10"
        aria-label="Voltar para a frente do card"
        @click="emit('flip')"
      >
        <Undo2 class="h-4 w-4" aria-hidden="true" /> Voltar
      </button>
    </div>

    <div class="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
      <h3 class="text-sm font-semibold leading-snug text-white">{{ product.title }}</h3>
      <p v-if="product.brand" class="text-xs text-silver-400">Marca: {{ product.brand }}</p>
      <p class="text-xs leading-relaxed text-silver-200">{{ product.description }}</p>

      <ul v-if="product.features?.length" class="space-y-1.5" aria-label="Principais características">
        <li v-for="f in product.features" :key="f" class="flex items-start gap-2 text-xs text-silver-100">
          <Check class="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
          <span>{{ f }}</span>
        </li>
      </ul>

      <p class="flex items-start gap-1.5 text-[11px] leading-snug text-silver-400">
        <Info class="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Preço, frete e disponibilidade são definidos pela loja e podem mudar sem aviso.
      </p>
    </div>

    <BuyButton :product="product" />
  </div>
</template>
