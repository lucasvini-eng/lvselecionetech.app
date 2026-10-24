<script setup>
import { reactive, ref, computed } from 'vue'
import { Star, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-vue-next'
import { sendFeedback } from '../services/feedbackService'

const MAX_COMMENT = 1000
const form = reactive({ rating: 0, comment: '', email: '', website: '' }) // website = honeypot
const hover = ref(0)
const errors = reactive({ rating: '', comment: '', email: '' })
const status = ref('idle') // idle | sending | success | error
const serverMessage = ref('')

const sending = computed(() => status.value === 'sending')
const labels = ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate() {
  errors.rating = form.rating >= 1 && form.rating <= 5 ? '' : 'Escolha uma nota de 1 a 5 estrelas.'
  errors.comment = form.comment.length > MAX_COMMENT ? `O comentário deve ter até ${MAX_COMMENT} caracteres.` : ''
  errors.email = form.email && !EMAIL_RE.test(form.email.trim()) ? 'Digite um e-mail válido ou deixe o campo vazio.' : ''
  return !errors.rating && !errors.comment && !errors.email
}

async function submit() {
  serverMessage.value = ''
  if (!validate()) {
    status.value = 'idle'
    return
  }
  status.value = 'sending'
  try {
    await sendFeedback({
      rating: form.rating,
      comment: form.comment.trim(),
      email: form.email.trim(),
      website: form.website
    })
    // Sucesso só é exibido depois que o servidor confirmou o recebimento
    status.value = 'success'
    form.rating = 0
    form.comment = ''
    form.email = ''
  } catch (e) {
    status.value = 'error'
    serverMessage.value = e.message
  }
}
</script>

<template>
  <section id="feedback" aria-labelledby="feedback-titulo" class="scroll-mt-24 py-12">
    <div class="container-page">
      <div class="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-navy-900/80 p-6 shadow-card sm:p-9">
        <h2 id="feedback-titulo" class="font-display text-2xl font-bold text-white sm:text-3xl">Sua opinião é importante</h2>
        <p class="mt-2 text-sm text-silver-400">Conte como foi a sua experiência no site. Isso nos ajuda a melhorar.</p>

        <div v-if="status === 'success'" role="status" class="mt-6 flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">
          <CheckCircle2 class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p class="font-semibold">Feedback enviado!</p>
            <p class="text-sm">Obrigado por ajudar a melhorar o LVSelecioneTech.</p>
            <button type="button" class="mt-2 text-sm underline" @click="status = 'idle'">Enviar outro feedback</button>
          </div>
        </div>

        <form v-else class="mt-6 space-y-5" novalidate @submit.prevent="submit">
          <!-- Estrelas -->
          <fieldset>
            <legend class="mb-2 text-sm font-medium text-silver-100">Como você avalia o site?</legend>
            <div class="flex items-center gap-1" @mouseleave="hover = 0">
              <template v-for="n in 5" :key="n">
                <input :id="`star-${n}`" v-model.number="form.rating" type="radio" name="rating" :value="n" class="peer sr-only" />
                <label
                  :for="`star-${n}`"
                  class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg transition hover:bg-white/10 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-400"
                  :title="`${n} - ${labels[n - 1]}`"
                  @mouseenter="hover = n"
                >
                  <Star
                    class="h-7 w-7 transition"
                    :class="(hover || form.rating) >= n ? 'fill-cyan-400 text-cyan-400' : 'text-silver-400'"
                    aria-hidden="true"
                  />
                  <span class="sr-only">{{ n }} {{ n === 1 ? 'estrela' : 'estrelas' }} — {{ labels[n - 1] }}</span>
                </label>
              </template>
              <span v-if="form.rating" class="ml-2 text-sm text-cyan-300">{{ labels[form.rating - 1] }}</span>
            </div>
            <p v-if="errors.rating" class="mt-1 text-sm text-red-300" role="alert">{{ errors.rating }}</p>
          </fieldset>

          <div>
            <label for="fb-comment" class="mb-1.5 block text-sm font-medium text-silver-100">
              Comentário ou sugestão <span class="text-silver-400">(opcional)</span>
            </label>
            <textarea
              id="fb-comment"
              v-model="form.comment"
              rows="4"
              :maxlength="MAX_COMMENT + 200"
              class="w-full rounded-xl border border-white/15 bg-navy-950/60 p-3 text-sm text-silver-50 placeholder:text-silver-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              placeholder="O que você gostou? O que podemos melhorar?"
              :aria-invalid="!!errors.comment"
              aria-describedby="fb-comment-count"
            ></textarea>
            <p id="fb-comment-count" class="mt-1 text-right text-xs" :class="form.comment.length > MAX_COMMENT ? 'text-red-300' : 'text-silver-400'">
              {{ form.comment.length }}/{{ MAX_COMMENT }}
            </p>
            <p v-if="errors.comment" class="text-sm text-red-300" role="alert">{{ errors.comment }}</p>
          </div>

          <div>
            <label for="fb-email" class="mb-1.5 block text-sm font-medium text-silver-100">
              E-mail para resposta <span class="text-silver-400">(opcional)</span>
            </label>
            <input
              id="fb-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              inputmode="email"
              class="min-h-[44px] w-full rounded-xl border border-white/15 bg-navy-950/60 px-3 text-sm text-silver-50 placeholder:text-silver-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              placeholder="voce@exemplo.com"
              :aria-invalid="!!errors.email"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-300" role="alert">{{ errors.email }}</p>
          </div>

          <!-- Honeypot: invisível para pessoas, bots costumam preencher -->
          <div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label for="fb-website">Não preencha este campo</label>
            <input id="fb-website" v-model="form.website" type="text" tabindex="-1" autocomplete="off" />
          </div>

          <div v-if="status === 'error'" role="alert" class="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            <AlertCircle class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{{ serverMessage }}</span>
          </div>

          <button type="submit" class="btn-primary w-full sm:w-auto" :disabled="sending">
            <Loader2 v-if="sending" class="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            <Send v-else class="h-4 w-4" aria-hidden="true" />
            {{ sending ? 'Enviando…' : 'Enviar feedback' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
