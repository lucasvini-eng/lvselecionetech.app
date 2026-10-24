<script setup>
import { computed } from 'vue'
import { platformInfo } from '../services/affiliate'

const props = defineProps({ platform: { type: String, required: true } })
const info = computed(() => platformInfo(props.platform))

// Cores neutras da marca; a plataforma é identificada principalmente pelo texto
const styles = computed(() =>
  props.platform === 'shopee'
    ? 'border-orange-300/40 bg-orange-400/10 text-orange-200'
    : 'border-yellow-200/40 bg-yellow-300/10 text-yellow-100'
)
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
    :class="styles"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
    {{ info.name }}
  </span>
</template>
