import 'dotenv/config'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

import { parseFeedback, sanitizeText, isHttpsUrl } from './lib/validate.js'
import { isMailConfigured, sendFeedbackMail } from './lib/mailer.js'
import { readProducts, writeProducts } from './lib/store.js'
import { lookupProduct, detectPlatform } from './providers/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT) || 3001

const CATEGORY_IDS = ['monitores', 'teclados', 'mouses', 'fones-de-ouvido', 'notebooks', 'pcs', 'cadeiras-gamers']

app.disable('x-powered-by')
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1)

app.use(
  helmet({
    // CSP do site estático (fontes do Google, imagens https de lojas)
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"]
      }
    }
  })
)

const allowed = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
app.use(cors({ origin: allowed.length ? allowed : false, methods: ['GET', 'POST', 'PUT', 'DELETE'] }))
app.use(express.json({ limit: '20kb' }))

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitos envios. Tente novamente em alguns minutos.' }
})

app.post('/api/feedback', feedbackLimiter, async (req, res) => {
  // Honeypot: bots preenchem; respondemos "ok" sem enviar nada
  if (req.body?.website) return res.status(200).json({ ok: true })

  const parsed = parseFeedback(req.body)
  if (!parsed.ok) return res.status(400).json({ error: parsed.errors.join(' ') })

  if (!isMailConfigured()) {
    console.error('[feedback] SMTP não configurado.')
    return res.status(503).json({ error: 'O envio de feedback ainda não está configurado no servidor.' })
  }

  try {
    await sendFeedbackMail(parsed.value)
    return res.status(200).json({ ok: true }) // confirma só após o SMTP aceitar a mensagem
  } catch (e) {
    console.error('[feedback] falha no envio:', e.message)
    return res.status(502).json({ error: 'Não foi possível enviar seu feedback agora. Tente novamente mais tarde.' })
  }
})

/* ------------------------------------------------------------------ */
/* Produtos (público: leitura)                                         */
/* ------------------------------------------------------------------ */
app.get('/api/products', async (_req, res) => {
  try {
    const list = (await readProducts())
      .filter((p) => p.active !== false)
      .sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999))
    res.set('Cache-Control', 'public, max-age=60')
    res.json({ products: list })
  } catch (e) {
    console.error('[products]', e.message)
    res.status(500).json({ error: 'Não foi possível carregar os produtos.' })
  }
})

/* ------------------------------------------------------------------ */
/* Admin (token Bearer definido em ADMIN_TOKEN)                        */
/* ------------------------------------------------------------------ */
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false })

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN
  if (!expected || expected.length < 16) {
    return res.status(503).json({ error: 'ADMIN_TOKEN não configurado (mínimo 16 caracteres).' })
  }
  const given = (req.get('authorization') || '').replace(/^Bearer\s+/i, '')
  const a = crypto.createHash('sha256').update(given).digest()
  const b = crypto.createHash('sha256').update(expected).digest()
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'Token de administrador inválido.' })
  next()
}

app.post('/api/products/lookup', adminLimiter, requireAdmin, async (req, res) => {
  const affiliateUrl = String(req.body?.url || '').trim()
  const productUrl = String(req.body?.productUrl || '').trim()
  if (!isHttpsUrl(affiliateUrl)) return res.status(400).json({ error: 'Informe uma URL https válida.' })
  try {
    const data = await lookupProduct({ affiliateUrl, productUrl })
    return res.json(data)
  } catch (e) {
    console.error('[lookup erro]:', e.message)
    return res.status(e.status || 400).json({ error: e.message || 'Não foi possível buscar as informações do link.' })
  }
})

function buildProduct(body, existing = {}) {
  const errors = []
  const affiliateUrl = String(body.affiliateUrl || '').trim()
  const platform = detectPlatform(affiliateUrl)
  if (!platform) errors.push('Link de afiliado inválido (use Shopee ou Mercado Livre, com https).')

  const title = sanitizeText(body.title, 200)
  if (!title) errors.push('Título obrigatório.')

  const category = String(body.category || '')
  if (!CATEGORY_IDS.includes(category)) errors.push('Categoria inválida.')

  const price = body.price === '' || body.price == null ? null : Number(body.price)
  if (price !== null && (!Number.isFinite(price) || price < 0)) errors.push('Preço inválido.')
  const previousPrice = body.previousPrice === '' || body.previousPrice == null ? null : Number(body.previousPrice)
  if (previousPrice !== null && (!Number.isFinite(previousPrice) || previousPrice < 0)) errors.push('Preço anterior inválido.')

  const image = String(body.image || '').trim()
  if (image && !(isHttpsUrl(image) || image.startsWith('/images/'))) errors.push('Imagem deve ser https ou /images/...')

  const features = (Array.isArray(body.features) ? body.features : [])
    .map((f) => sanitizeText(f, 160))
    .filter(Boolean)
    .slice(0, 10)

  if (errors.length) return { errors }

  return {
    product: {
      id: existing.id || sanitizeText(body.id, 60) || `${category}-${Date.now().toString(36)}`,
      title,
      brand: sanitizeText(body.brand, 80),
      image: image || null,
      price,
      previousPrice,
      description: sanitizeText(body.description, 600),
      features,
      affiliateUrl,
      platform,
      category,
      position: Number.isFinite(Number(body.position)) ? Number(body.position) : existing.position ?? Date.now(),
      updatedAt: new Date().toISOString(),
      active: body.active !== false
    }
  }
}

app.post('/api/admin/products', adminLimiter, requireAdmin, async (req, res) => {
  const { product, errors } = buildProduct(req.body)
  if (errors) return res.status(400).json({ error: errors.join(' ') })
  const list = await readProducts()
  if (list.some((p) => p.id === product.id)) return res.status(409).json({ error: 'Já existe um produto com este id.' })
  list.push(product)
  await writeProducts(list)
  res.status(201).json({ product })
})

app.put('/api/admin/products/:id', adminLimiter, requireAdmin, async (req, res) => {
  const list = await readProducts()
  const i = list.findIndex((p) => p.id === req.params.id)
  if (i === -1) return res.status(404).json({ error: 'Produto não encontrado.' })
  const { product, errors } = buildProduct(req.body, list[i])
  if (errors) return res.status(400).json({ error: errors.join(' ') })
  list[i] = product
  await writeProducts(list)
  res.json({ product })
})

app.delete('/api/admin/products/:id', adminLimiter, requireAdmin, async (req, res) => {
  const list = await readProducts()
  const next = list.filter((p) => p.id !== req.params.id)
  if (next.length === list.length) return res.status(404).json({ error: 'Produto não encontrado.' })
  await writeProducts(next)
  res.status(204).end()
})

app.get('/api/admin/products', adminLimiter, requireAdmin, async (_req, res) => {
  res.json({ products: await readProducts() })
})

/* ------------------------------------------------------------------ */
/* Site estático (opcional): SERVE_STATIC=true serve a pasta dist/     */
/* ------------------------------------------------------------------ */
if (process.env.SERVE_STATIC === 'true') {
  const dist = path.resolve(__dirname, '../dist')
  app.use(express.static(dist, { maxAge: '1h' }))
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.use((err, _req, res, _next) => {
  console.error('[erro]', err.message)
  res.status(err.status || 500).json({ error: 'Erro interno do servidor.' })
})

app.listen(PORT, () => console.log(`API LVSelecioneTech em http://localhost:${PORT}`))
