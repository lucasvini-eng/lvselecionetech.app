<script setup>
import { Monitor, Keyboard, Mouse, Headphones, Laptop, Cpu, Armchair, ArrowRight, PackageOpen } from 'lucide-vue-next'
import ProductGrid from './ProductGrid.vue'

const icons = { Monitor, Keyboard, Mouse, Headphones, Laptop, Cpu, Armchair }

defineProps({ category: { type: Object, required: true } })
const emit = defineEmits(['see-more'])
</script>

<template>
  <!-- id semântico = slug da categoria (alvo da navegação por âncora) -->
  <section :id="category.id" :aria-labelledby="`${category.id}-titulo`" class="scroll-mt-24 py-8 sm:py-10">
    <div class="container-page">
      <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            <component :is="icons[category.icon]" class="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 :id="`${category.id}-titulo`" class="font-display text-2xl font-bold text-white sm:text-3xl">
              {{ category.name }}
            </h2>
            <p class="text-sm text-silver-400">{{ category.description }}</p>
          </div>
        </div>

        <button
          v-if="category.total > category.products.length"
          type="button"
          class="btn-ghost"
          @click="emit('see-more', category)"
        >
          Ver todos ({{ category.total }}) <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <ProductGrid v-if="category.products.length" :products="category.products" />

      <div v-else class="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 p-10 text-center text-silver-400">
        <PackageOpen class="h-8 w-8" aria-hidden="true" />
        <p class="text-sm">Ainda não há produtos cadastrados em {{ category.name }}.</p>
      </div>
    </div>
  </section>
</template>
