<script setup>
import { ArrowDown, ShieldCheck, Zap, Link2 } from 'lucide-vue-next'
import ProductSearch from './ProductSearch.vue'

defineProps({ query: { type: String, default: '' } })
const emit = defineEmits(['update:query', 'search'])
</script>

<template>
  <section class="relative overflow-hidden pt-28 pb-14 sm:pt-36 sm:pb-20" aria-labelledby="hero-title">
    <!-- Circuitos decorativos (sutis) -->
    <svg
      class="pointer-events-none absolute inset-0 h-full w-full opacity-40"
      viewBox="0 0 1200 520"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g fill="none" stroke="#2FE0FF" stroke-width="1.5" class="circuit-line">
        <path d="M0 120 H220 L260 160 H520" />
        <path d="M0 200 H140 L190 250 H420" />
        <path d="M1200 90 H980 L940 130 H760" />
        <path d="M1200 330 H1040 L990 380 H800" />
      </g>
      <g fill="#041335" stroke="#2FE0FF" stroke-width="2">
        <circle cx="520" cy="160" r="6" />
        <circle cx="420" cy="250" r="6" />
        <circle cx="760" cy="130" r="6" />
        <circle cx="800" cy="380" r="6" />
      </g>
    </svg>
    <div
      class="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl sm:h-96 sm:w-96"
      aria-hidden="true"
    ></div>

    <div class="container-page relative text-center">
      <p class="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
        <Zap class="h-3.5 w-3.5" aria-hidden="true" /> Curadoria de tecnologia
      </p>

      <h1 id="hero-title" class="font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
        Tecnologia que <span class="gradient-text">vale a pena.</span>
      </h1>
      <p class="mx-auto mt-5 max-w-2xl text-base text-silver-200 sm:text-lg">
        Encontre produtos selecionados para melhorar seu setup, trabalho e entretenimento.
      </p>

      <div class="mx-auto mt-8 max-w-2xl">
        <ProductSearch
          :model-value="query"
          input-id="busca-hero"
          size="lg"
          @update:model-value="emit('update:query', $event)"
          @submit="emit('search')"
        />
      </div>

      <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href="#monitores" class="btn-primary w-full sm:w-auto">
          Explorar produtos <ArrowDown class="h-4 w-4" aria-hidden="true" />
        </a>
        <a href="#feedback" class="btn-ghost w-full sm:w-auto">Avaliar o site</a>
      </div>

      <ul class="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-silver-400">
        <li class="flex items-center gap-2"><ShieldCheck class="h-4 w-4 text-cyan-400" aria-hidden="true" /> Compra na Shopee e no Mercado Livre</li>
        <li class="flex items-center gap-2"><Link2 class="h-4 w-4 text-cyan-400" aria-hidden="true" /> Sem custo extra para você</li>
      </ul>
    </div>
  </section>
</template>
