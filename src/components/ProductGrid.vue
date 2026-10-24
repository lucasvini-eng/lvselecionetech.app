<script setup>
import ProductCard from './ProductCard.vue'
import { useFavorites } from '../composables/useFavorites'

defineProps({ products: { type: Array, required: true } })
const { isFavorite, toggle } = useFavorites()
</script>

<template>
  <div class="grid grid-cols-1 gap-5 min-[560px]:grid-cols-2 lg:grid-cols-4">
    <ProductCard
      v-for="p in products"
      :key="p.id"
      :product="p"
      :favorite="isFavorite(p.id)"
      @toggle-favorite="toggle(p.id)"
    />
  </div>
</template>
