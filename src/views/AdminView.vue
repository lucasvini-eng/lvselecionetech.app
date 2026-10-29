<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowLeft, Search, Save, Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-vue-next'
import { CATEGORIES, PLATFORMS } from '../data/products'
import { validateAffiliateUrl } from '../services/affiliate'
import { formatPrice } from '../utils/format'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const DEFAULT_TOKEN = 'MERC@DO&SHOP2026AFILIADO'
const token = ref(sessionStorage.getItem('lvst:admin') || DEFAULT_TOKEN)
const affiliateUrl = ref('')
const productUrl = ref('')
const busy = ref(false)
const info = ref('')
const error = ref('')
const missing = ref([])
const step = ref(1) // 1 = informar link, 2 = revisar e confirmar
const saved = ref([])

const form = reactive(emptyForm())
function emptyForm() {
  return { title: '', brand: '', image: '', price: '', previousPrice: '', description: '', featuresText: '', category: '', platform: '' }
}

const linkCheck = computed(() => (affiliateUrl.value ? validateAffiliateUrl(affiliateUrl.value) : null))

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}`, ...(options.headers || {}) }
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `Erro ${res.status}`)
  return data
}

function persistToken() {
  sessionStorage.setItem('lvst:admin', token.value)
}

async function loadSaved() {
  try {
    saved.value = (await api('/api/admin/products')).products
  } catch {
    saved.value = []
  }
}
onMounted(() => {
  persistToken()
  if (token.value) loadSaved()
})

async function lookup() {
  error.value = info.value = ''
  const check = validateAffiliateUrl(affiliateUrl.value)
  if (!check.valid) {
    error.value = check.error
    return
  }
  persistToken()
  busy.value = true
  try {
    const r = await api('/api/products/lookup', {
      method: 'POST',
      body: JSON.stringify({ url: affiliateUrl.value.trim(), productUrl: productUrl.value.trim() })
    })
    Object.assign(form, emptyForm(), {
      title: r.fields.title || '',
      brand: r.fields.brand || '',
      image: r.fields.image || '',
      price: r.fields.price ?? '',
      previousPrice: r.fields.previousPrice ?? '',
      description: r.fields.description || '',
      featuresText: (r.fields.features || []).join('\n'),
      platform: r.platform,
      category: r.fields.suggestedCategory || form.category || ''
    })
    missing.value = r.missing || []
    info.value = r.message
    step.value = 2
    loadSaved()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

function manual() {
  const check = validateAffiliateUrl(affiliateUrl.value)
  if (!check.valid) {
    error.value = check.error
    return
  }
  Object.assign(form, emptyForm(), { platform: check.platform })
  missing.value = ['title', 'image', 'price', 'description']
  info.value = 'Cadastro manual: preencha os campos abaixo.'
  step.value = 2
}

const isMissing = (k) => missing.value.includes(k) && !String(form[k]).trim()

async function save() {
  error.value = ''
  busy.value = true
  try {
    await api('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        affiliateUrl: affiliateUrl.value.trim(),
        title: form.title,
        brand: form.brand,
        image: form.image,
        price: form.price,
        previousPrice: form.previousPrice,
        description: form.description,
        features: form.featuresText.split('\n'),
        category: form.category
      })
    })
    info.value = 'Produto publicado na vitrine.'
    affiliateUrl.value = productUrl.value = ''
    Object.assign(form, emptyForm())
    step.value = 1
    loadSaved()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

async function remove(p) {
  if (!confirm(`Remover "${p.title}"?`)) return
  try {
    await api(`/api/admin/products/${encodeURIComponent(p.id)}`, { method: 'DELETE' })
    loadSaved()
  } catch (e) {
    error.value = e.message
  }
}

const field =
  'w-full rounded-xl border bg-navy-950/60 px-3 min-h-[44px] text-sm text-silver-50 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40'
</script>

<template>
  <div class="container-page max-w-3xl py-10">
    <a href="/" class="mb-6 inline-flex items-center gap-2 text-sm text-cyan-300 hover:underline">
      <ArrowLeft class="h-4 w-4" aria-hidden="true" /> Voltar ao site
    </a>
    <h1 class="font-display text-3xl font-bold text-white">Cadastro de produtos</h1>
    <p class="mt-1 text-sm text-silver-400">
      Informe o link de afiliado; os dados são buscados apenas em fontes oficiais configuradas no servidor. Revise tudo antes de publicar.
    </p>

    <div class="mt-6 space-y-4 rounded-2xl border border-white/10 bg-navy-900/80 p-5">
      <div>
        <label for="ad-token" class="mb-1 block text-sm font-medium">Token de administrador</label>
        <input id="ad-token" v-model="token" type="password" autocomplete="off" class="border-white/15" :class="field" @change="persistToken(); loadSaved()" />
      </div>

      <template v-if="step === 1">
        <div>
          <label for="ad-link" class="mb-1 block text-sm font-medium">Link de afiliado (Shopee ou Mercado Livre)</label>
          <input
            id="ad-link"
            v-model="affiliateUrl"
            type="url"
            placeholder="https://… (cole seu link aqui e aperte Buscar dados ou Enter)"
            class="border-white/15"
            :class="field"
            @keydown.enter.prevent="lookup"
          />
          <p v-if="linkCheck && !linkCheck.valid" class="mt-1 text-sm text-red-300" role="alert">{{ linkCheck.error }}</p>
          <p v-else-if="linkCheck" class="mt-1 text-sm text-cyan-300">Plataforma: {{ PLATFORMS[linkCheck.platform].name }}</p>
        </div>
        <div>
          <label for="ad-prod" class="mb-1 block text-sm font-medium">
            URL original do produto <span class="text-silver-400">(opcional; links encurtados como shope.ee e meli.la são descurtados automaticamente)</span>
          </label>
          <input
            id="ad-prod"
            v-model="productUrl"
            type="url"
            placeholder="https://…"
            class="border-white/15"
            :class="field"
            @keydown.enter.prevent="lookup"
          />
        </div>
        <div class="flex flex-col gap-2 sm:flex-row">
          <button type="button" class="btn-primary" :disabled="busy" @click="lookup">
            <Loader2 v-if="busy" class="h-4 w-4 animate-spin" aria-hidden="true" /><Search v-else class="h-4 w-4" aria-hidden="true" /> Buscar dados
          </button>
          <button type="button" class="btn-ghost" @click="manual">Cadastrar manualmente</button>
        </div>
      </template>

      <template v-else>
        <p class="text-xs text-silver-400">Link: <span class="break-all text-silver-200">{{ affiliateUrl }}</span> — {{ PLATFORMS[form.platform]?.name }}</p>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label for="f-title" class="mb-1 block text-sm font-medium">Título *</label>
            <input id="f-title" v-model="form.title" :class="[field, isMissing('title') ? 'border-yellow-400' : 'border-white/15']" />
          </div>
          <div>
            <label for="f-cat" class="mb-1 block text-sm font-medium">Categoria *</label>
            <select id="f-cat" v-model="form.category" class="border-white/15" :class="field">
              <option value="" disabled>Selecione…</option>
              <option v-for="c in CATEGORIES" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label for="f-brand" class="mb-1 block text-sm font-medium">Marca</label>
            <input id="f-brand" v-model="form.brand" class="border-white/15" :class="field" />
          </div>
          <div>
            <label for="f-price" class="mb-1 block text-sm font-medium">Preço atual (R$)</label>
            <input id="f-price" v-model="form.price" type="number" step="0.01" min="0" :class="[field, isMissing('price') ? 'border-yellow-400' : 'border-white/15']" />
          </div>
          <div>
            <label for="f-prev" class="mb-1 block text-sm font-medium">Preço anterior (R$)</label>
            <input id="f-prev" v-model="form.previousPrice" type="number" step="0.01" min="0" class="border-white/15" :class="field" />
          </div>
          <div class="sm:col-span-2">
            <label for="f-img" class="mb-1 block text-sm font-medium">Imagem (URL https ou /images/produtos/arquivo.webp)</label>
            <input id="f-img" v-model="form.image" :class="[field, isMissing('image') ? 'border-yellow-400' : 'border-white/15']" />
          </div>
          <div class="sm:col-span-2">
            <label for="f-desc" class="mb-1 block text-sm font-medium">Descrição</label>
            <textarea id="f-desc" v-model="form.description" rows="3" class="py-2" :class="[field, isMissing('description') ? 'border-yellow-400' : 'border-white/15']"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label for="f-feat" class="mb-1 block text-sm font-medium">Características (uma por linha)</label>
            <textarea id="f-feat" v-model="form.featuresText" rows="4" class="border-white/15 py-2" :class="field"></textarea>
          </div>
        </div>

        <p v-if="missing.length" class="flex items-start gap-2 text-sm text-yellow-200">
          <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> Campos não obtidos automaticamente (destacados): preencha manualmente.
        </p>

        <div class="flex flex-col gap-2 sm:flex-row">
          <button type="button" class="btn-primary" :disabled="busy || !form.title || !form.category" @click="save">
            <Loader2 v-if="busy" class="h-4 w-4 animate-spin" aria-hidden="true" /><Save v-else class="h-4 w-4" aria-hidden="true" /> Confirmar e publicar
          </button>
          <button type="button" class="btn-ghost" @click="step = 1">Voltar</button>
        </div>
      </template>

      <p v-if="info" role="status" class="flex items-start gap-2 text-sm text-cyan-200"><CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{{ info }}</p>
      <p v-if="error" role="alert" class="flex items-start gap-2 text-sm text-red-300"><AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{{ error }}</p>
    </div>

    <h2 class="mt-10 font-display text-xl font-bold text-white">Produtos publicados ({{ saved.length }})</h2>
    <ul class="mt-3 space-y-2">
      <li v-for="p in saved" :key="p.id" class="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-navy-900/60 p-3 text-sm">
        <span class="min-w-0 flex-1 truncate">{{ p.title }} <span class="text-silver-400">— {{ formatPrice(p.price) }}</span></span>
        <button type="button" class="flex h-10 w-10 items-center justify-center rounded-lg text-red-300 hover:bg-red-500/10" :aria-label="`Remover ${p.title}`" @click="remove(p)">
          <Trash2 class="h-4 w-4" aria-hidden="true" />
        </button>
      </li>
      <li v-if="!saved.length" class="text-sm text-silver-400">Nenhum produto cadastrado pelo painel ainda.</li>
    </ul>
  </div>
</template>
