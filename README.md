# LVSelecioneTech

Vitrine de tecnologia com links de afiliado da **Shopee** e do **Mercado Livre**.
Stack: Vue 3 (Composition API) · Vite · Tailwind CSS · Vue Router · Lucide · LocalStorage. Backend opcional em Node/Express.

> O site **não vende nada**: os botões levam à página do produto na plataforma, usando o link de afiliado cadastrado.

## Identidade visual (extraída da logo)

| Token | Cor | Uso |
|---|---|---|
| `navy-950/900/800` | `#020B24` `#041335` `#071C4D` | fundo, cards |
| `cyan-400` | `#2FE0FF` | anel neon / "Tech": destaques, ícones, foco |
| `brand-500` | `#1A6CFF` | azul elétrico do "V": gradiente de botões |
| `silver-50…200` | `#F5F8FF` … `#CBD6EE` | textos (branco prateado do "L" e "S") |

Fontes: Space Grotesk (títulos) e Inter (texto). Definidas em `tailwind.config.js`.

## Rodar localmente

```bash
npm install
cp .env.example .env      # preencha o que for usar
npm run dev               # site em http://localhost:5173
npm run server:dev        # API em http://localhost:3001 (o Vite faz proxy de /api)
```

O site funciona só com o frontend (produtos vêm de `src/data/products.js`). O **feedback por e-mail** e o **painel de cadastro** precisam do backend.

## Produtos

### Dados de demonstração
Os 28 itens de `src/data/products.js` são **exemplos** (`demo: true`): sem link de afiliado, sem imagem, preços fictícios.
O botão de compra fica desativado ("Link de afiliado pendente") até existir um `affiliateUrl` válido.

### Opção A — editar o arquivo
Substitua os itens por produtos reais:
```js
{ id: 'monitor-001', title: '…', image: '/images/produtos/monitor-001.webp', price: 799.9,
  previousPrice: null, description: '…', features: ['…'], affiliateUrl: 'https://…SEU-LINK',
  platform: 'mercado-livre', category: 'monitores', updatedAt: null, active: true }
```
Imagens vão em `public/images/produtos/`. A ordem do array é a ordem de exibição; cada categoria mostra até 4.
Links são validados: precisam ser `https` e de domínio Shopee/Mercado Livre (`src/services/affiliate.js`).

### Opção B — painel `/admin` + backend
1. No `.env`: `ADMIN_TOKEN` (≥16 caracteres, ex.: `openssl rand -hex 32`) e `VITE_USE_API=true`.
2. Acesse `/admin`, informe o token e o link de afiliado → **Buscar dados** → revise → **Confirmar e publicar**.
3. Os produtos ficam em `server/data/products.json` (troque por um banco se o catálogo crescer).

Se a plataforma não fornecer algum dado, o campo é destacado para preenchimento manual. Links encurtados (`meli.la`, `shope.ee`)
não são consultados: informe a URL original do produto ou cadastre manualmente.

### Fontes oficiais de dados (nada de scraping)
- **Mercado Livre:** crie um app em developers.mercadolivre.com.br e defina `ML_CLIENT_ID` / `ML_CLIENT_SECRET`. Provider em `server/providers/mercadoLivre.js`.
- **Shopee:** use a Affiliate Open API do programa de afiliados e defina `SHOPEE_APP_ID` / `SHOPEE_APP_SECRET`. Provider em `server/providers/shopee.js`.

⚠️ Os dois providers foram escritos conforme a documentação pública conhecida, mas **não foram testados com credenciais reais**
(inclusive a assinatura e os campos da API da Shopee). Confira a documentação oficial vigente; em qualquer falha o painel cai no cadastro manual.

## Feedback por e-mail

Configure no `.env` do servidor: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `FEEDBACK_TO_EMAIL` (o e-mail administrativo, definido por você).
Serviços SMTP com plano gratuito servem (Brevo, Gmail com senha de app, Zoho etc.).
O endpoint `POST /api/feedback` valida e sanitiza os dados, limita a 5 envios/15 min por IP, tem campo honeypot anti-spam e só responde sucesso depois que o SMTP aceita a mensagem. Sem SMTP configurado, responde erro 503 (não finge sucesso).
`VITE_PUBLIC_CONTACT_EMAIL` é apenas para exibir o contato no rodapé.

## Build e publicação

```bash
npm run build          # gera dist/
```
- **Um só serviço (Render, Railway, VPS):** `SERVE_STATIC=true npm run server` serve `dist/` e a API juntos (defina `TRUST_PROXY=1` atrás de proxy).
- **Frontend estático + API separada:** publique `dist/` (Netlify, Vercel, Cloudflare Pages), a API em outro host, e defina `VITE_API_BASE_URL` no build e `CORS_ORIGINS` na API. Em hospedagem estática, configure fallback para `index.html` (SPA).

## Estrutura
```
src/components   Header, Hero, CategorySection, ProductCard(+Front/Back), BuyButton, FeedbackForm, Footer…
src/composables  useProducts, useProductSearch, useFavorites
src/services     productService, feedbackService, affiliate (validação de links)
src/data         products.js (demo)
src/views        HomeView, AdminView
server/          Express: feedback, produtos, providers oficiais
```

## Pendências antes de publicar
- Trocar os dados demo por produtos reais com links de afiliado.
- Textos de privacidade/termos/afiliados do rodapé são **modelos**: revise com orientação jurídica (LGPD) e com as regras de cada programa de afiliados.
- `lucide-vue-next` aparece como "deprecated" no npm (sucessor: `@lucide/vue`); funciona normalmente, a migração é opcional.
