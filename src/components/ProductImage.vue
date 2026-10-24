<script setup>
import { computed, ref } from 'vue'
import { Monitor, Keyboard, Mouse, Headphones, Laptop, Cpu, Armchair, Package } from 'lucide-vue-next'

const props = defineProps({
  src: { type: String, default: null },
  alt: { type: String, default: '' },
  category: { type: String, default: '' }
})

const icons = {
  monitores: Monitor,
  teclados: Keyboard,
  mouses: Mouse,
  'fones-de-ouvido': Headphones,
  notebooks: Laptop,
  pcs: Cpu,
  'cadeiras-gamers': Armchair
}
const Icon = computed(() => icons[props.category] || Package)
const failed = ref(false)
</script>

<template>
  <div class="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-navy-800 to-navy-900">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      width="400"
      height="300"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-contain p-2"
      @error="failed = true"
    />
    <!-- Placeholder (produto sem imagem cadastrada) -->
    <div v-else class="flex h-full w-full flex-col items-center justify-center gap-2 text-cyan-400/80" role="img" :aria-label="`Imagem ilustrativa: ${alt}`">
      <component :is="Icon" class="h-14 w-14" stroke-width="1.25" aria-hidden="true" />
      <span class="text-[11px] uppercase tracking-wider text-silver-400">Imagem não cadastrada</span>
    </div>
  </div>
</template>
