<script setup>
import { Search, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Buscar produtos, categorias ou características…' },
  size: { type: String, default: 'md' }, // 'md' | 'lg'
  inputId: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue', 'submit'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <form role="search" class="relative w-full" @submit.prevent="emit('submit')">
    <label :for="inputId" class="sr-only">Pesquisar produtos</label>
    <Search
      class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400"
      :class="size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'"
      aria-hidden="true"
    />
    <input
      :id="inputId"
      :value="modelValue"
      type="search"
      autocomplete="off"
      :placeholder="placeholder"
      class="w-full rounded-xl border border-white/15 bg-navy-900/80 pl-11 pr-11 text-silver-50 placeholder:text-silver-400 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 [&::-webkit-search-cancel-button]:hidden"
      :class="size === 'lg' ? 'min-h-[56px] text-base' : 'min-h-[44px] text-sm'"
      @input="onInput"
    />
    <button
      v-if="modelValue"
      type="button"
      class="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-silver-400 hover:bg-white/10 hover:text-white"
      aria-label="Limpar pesquisa"
      @click="emit('update:modelValue', '')"
    >
      <X class="h-4 w-4" aria-hidden="true" />
    </button>
  </form>
</template>
