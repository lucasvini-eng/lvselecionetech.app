<script setup>
import { computed } from 'vue'
import { ExternalLink, LinkIcon } from 'lucide-vue-next'
import { platformInfo, safeAffiliateHref } from '../services/affiliate'

const props = defineProps({ product: { type: Object, required: true } })

const info = computed(() => platformInfo(props.product.platform))
const href = computed(() => safeAffiliateHref(props.product))
</script>

<template>
  <div class="w-full">
    <!-- Link de afiliado exato, em nova aba, marcado como patrocinado -->
    <a
      v-if="href"
      :href="href"
      target="_blank"
      rel="sponsored noopener noreferrer"
      class="btn-primary w-full"
      :aria-label="`${info.buyLabel}: ${product.title} (abre em nova aba)`"
    >
      {{ info.buyLabel }}
      <ExternalLink class="h-4 w-4" aria-hidden="true" />
    </a>

    <!-- Sem link de afiliado válido: não há destino, o botão fica inativo -->
    <button
      v-else
      type="button"
      disabled
      class="inline-flex min-h-[44px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-2.5 text-sm font-medium text-silver-400"
    >
      <LinkIcon class="h-4 w-4" aria-hidden="true" />
      Link de afiliado pendente
    </button>

    <p class="mt-1.5 text-center text-[11px] text-silver-400">
      {{ href ? `Você será direcionado para ${info.name}` : 'Cadastre o link para ativar a compra' }}
    </p>
  </div>
</template>
