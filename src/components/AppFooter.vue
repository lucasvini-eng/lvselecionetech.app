<script setup>
import { computed } from 'vue'
import { Mail, ChevronDown } from 'lucide-vue-next'
import { CATEGORIES } from '../data/products'

const year = new Date().getFullYear()
// Apenas para exibição pública. O envio de feedback é feito pelo backend.
const contactEmail = import.meta.env.VITE_PUBLIC_CONTACT_EMAIL || ''
const hasEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
</script>

<template>
  <footer class="mt-10 border-t border-white/10 bg-navy-900/60">
    <div class="container-page grid gap-10 py-12 md:grid-cols-3">
      <div>
        <div class="flex items-center gap-3">
          <img src="/logo-256.webp" alt="" width="48" height="48" class="h-12 w-12 rounded-full" loading="lazy" decoding="async" />
          <span class="font-display text-xl font-bold"><span class="gradient-text">LVS</span>elecione<span class="text-cyan-400">Tech</span></span>
        </div>
        <p class="mt-4 max-w-sm text-sm text-silver-400">
          Curadoria de produtos de tecnologia para o seu setup. Reunimos opções e levamos você direto à Shopee ou ao Mercado Livre para comprar.
        </p>
      </div>

      <nav aria-label="Categorias no rodapé">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-silver-100">Categorias</h2>
        <ul class="grid grid-cols-2 gap-x-4 gap-y-1">
          <li v-for="c in CATEGORIES" :key="c.id">
            <a :href="`#${c.id}`" class="inline-block py-1.5 text-sm text-silver-400 hover:text-cyan-300">{{ c.name }}</a>
          </li>
        </ul>
      </nav>

      <div>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-silver-100">Contato</h2>
        <a v-if="hasEmail" :href="`mailto:${contactEmail}`" class="inline-flex items-center gap-2 text-sm text-silver-200 hover:text-cyan-300">
          <Mail class="h-4 w-4" aria-hidden="true" /> {{ contactEmail }}
        </a>
        <a v-else href="#feedback" class="inline-flex items-center gap-2 text-sm text-silver-200 hover:text-cyan-300">
          <Mail class="h-4 w-4" aria-hidden="true" /> Fale conosco pelo formulário de feedback
        </a>
      </div>
    </div>

    <!-- Informações legais (modelos: revisar com um profissional antes de publicar) -->
    <div class="container-page space-y-2 pb-8">
      <details id="afiliados" class="group rounded-xl border border-white/10 bg-navy-950/40 px-4 py-3">
        <summary class="flex min-h-[32px] cursor-pointer list-none items-center justify-between text-sm font-medium text-silver-100">
          Aviso de afiliados <ChevronDown class="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
        </summary>
        <p class="mt-2 text-sm text-silver-400">
          O LVSelecioneTech participa de programas de afiliados da Shopee e do Mercado Livre e pode receber comissão por compras realizadas
          por meio dos links do site, sem custo adicional para você, conforme as condições aplicáveis de cada programa. O site não vende
          produtos: a compra é feita na plataforma externa.
        </p>
      </details>
      <details id="privacidade" class="group rounded-xl border border-white/10 bg-navy-950/40 px-4 py-3">
        <summary class="flex min-h-[32px] cursor-pointer list-none items-center justify-between text-sm font-medium text-silver-100">
          Política de privacidade <ChevronDown class="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
        </summary>
        <p class="mt-2 text-sm text-silver-400">
          Os feedbacks enviados (nota, comentário e e-mail opcional) são usados apenas para melhorar o site e, se você informar e-mail, para
          responder à sua mensagem. Seus favoritos ficam salvos somente no seu navegador (LocalStorage). Ao clicar em um link de compra,
          você passa a ser regido pela política de privacidade da plataforma de destino.
        </p>
      </details>
      <details id="termos" class="group rounded-xl border border-white/10 bg-navy-950/40 px-4 py-3">
        <summary class="flex min-h-[32px] cursor-pointer list-none items-center justify-between text-sm font-medium text-silver-100">
          Termos de uso <ChevronDown class="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
        </summary>
        <p class="mt-2 text-sm text-silver-400">
          As informações exibidas têm caráter informativo. Preços, disponibilidade, frete e condições comerciais são definidos pelas
          plataformas ou vendedores e podem mudar sem aviso prévio. Confirme sempre os dados na página oficial do produto antes de comprar.
        </p>
      </details>

      <p class="pt-4 text-center text-xs text-silver-400">
        Preços, disponibilidade, frete e condições comerciais são definidos pelas plataformas ou vendedores e podem mudar sem aviso prévio.
      </p>
      <p class="text-center text-xs text-silver-400">© {{ year }} LVSelecioneTech. Todos os direitos reservados.</p>
    </div>
  </footer>
</template>
