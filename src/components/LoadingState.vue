<script setup>
import { AlertTriangle, RefreshCw } from 'lucide-vue-next'

defineProps({
  error: { type: String, default: '' },
  count: { type: Number, default: 4 }
})
const emit = defineEmits(['retry'])
</script>

<template>
  <div v-if="error" role="alert" class="flex flex-col items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center">
    <AlertTriangle class="h-8 w-8 text-red-300" aria-hidden="true" />
    <p class="text-sm text-red-100">{{ error }}</p>
    <button type="button" class="btn-ghost" @click="emit('retry')">
      <RefreshCw class="h-4 w-4" aria-hidden="true" /> Tentar novamente
    </button>
  </div>

  <div v-else class="grid grid-cols-1 gap-5 min-[560px]:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Carregando produtos">
    <div v-for="n in count" :key="n" class="h-[27rem] animate-pulse rounded-2xl border border-white/5 bg-navy-900/60 motion-reduce:animate-none"></div>
  </div>
</template>
