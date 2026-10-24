<script setup>
import { Monitor, Keyboard, Mouse, Headphones, Laptop, Cpu, Armchair } from 'lucide-vue-next'
import { CATEGORIES } from '../data/products'

const icons = { Monitor, Keyboard, Mouse, Headphones, Laptop, Cpu, Armchair }
</script>

<template>
  <nav aria-label="Atalhos de categorias" class="container-page">
    <ul class="grid grid-cols-2 gap-3 min-[480px]:grid-cols-4 lg:grid-cols-7">
      <li v-for="cat in CATEGORIES" :key="cat.id">
        <a
          :href="`#${cat.id}`"
          class="group flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-navy-900/70 px-2 py-4 text-center transition hover:-translate-y-0.5 hover:border-cyan-400/50 hover:shadow-glow motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <component :is="icons[cat.icon]" class="h-7 w-7 text-cyan-400 transition group-hover:text-cyan-300" aria-hidden="true" />
          <span class="text-xs font-semibold text-silver-100 sm:text-sm">{{ cat.name }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>
