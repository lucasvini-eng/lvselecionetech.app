<script setup>
import { ref } from 'vue'
import ProductCardFront from './ProductCardFront.vue'
import ProductCardBack from './ProductCardBack.vue'

defineProps({
  product: { type: Object, required: true },
  favorite: { type: Boolean, default: false }
})
const emit = defineEmits(['toggle-favorite'])

const flipped = ref(false)
const toggle = () => (flipped.value = !flipped.value)
</script>

<template>
  <article class="flip-scene h-[27rem] sm:h-[28rem]">
    <div class="flip-inner h-full" :class="{ 'is-flipped': flipped }">
      <!-- `inert` tira a face oculta da navegação por teclado e de leitores de tela -->
      <div class="flip-face flip-front h-full" :inert="flipped" :aria-hidden="flipped">
        <ProductCardFront
          :product="product"
          :favorite="favorite"
          @flip="toggle"
          @toggle-favorite="emit('toggle-favorite')"
        />
      </div>
      <div class="flip-face flip-back" :inert="!flipped" :aria-hidden="!flipped">
        <ProductCardBack :product="product" @flip="toggle" />
      </div>
    </div>
  </article>
</template>
