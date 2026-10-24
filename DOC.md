# LVSelecioneTech — Documentação do Projeto

## 1. Visão geral

O **LVSelecioneTech** é uma vitrine digital de produtos de tecnologia que atua como **afiliado da Shopee e do Mercado Livre**. O visitante navega por categorias, pesquisa produtos, vê detalhes e é levado à página do produto na plataforma de origem por meio do link de afiliado.

**O site não vende nada.** Não há carrinho, checkout nem pagamento. Toda compra acontece na Shopee ou no Mercado Livre.

### Principais funcionalidades

| Funcionalidade | Descrição |
|---|---|
| Vitrine por categoria | 7 categorias (Monitores, Teclados, Mouses, Fones de Ouvido, Notebooks, PCs, Cadeiras Gamers), até 4 produtos cada |
| Card com giro (flip) | Frente com imagem, título, preço e botão de compra; verso com descrição e características |
| Busca dinâmica | Filtra enquanto digita, sem acentos e sem diferenciar maiúsculas |
| Favoritos | Salvos no `localStorage` do navegador do visitante |
| Botão de compra | Texto automático por plataforma, abre o link de afiliado em nova aba |
| Feedback | Avaliação de 1 a 5 estrelas, enviada por e-mail ao administrador via backend |
| Painel `/admin` | Cadastro de produtos a partir do link de afiliado, com revisão antes de publicar |

---

## 2. Tecnologias

| Camada | Tecnologia | Uso |
|---|---|---|
| Interface | Vue 3 (Composition API, `<script setup>`) | Componentes e reatividade |
| Build | Vite 6 | Servidor de desenvolvimento e build |
| Estilo | Tailwind CSS 3 + CSS próprio | Layout responsivo; animações em `main.css` |
| Rotas | Vue Router 4 | `/` (vitrine) e `/admin` |
| Ícones | lucide-vue-next | Ícones consistentes |
| Persistência local | `localStorage` | Favoritos |
| Backend | Node.js + Express | Feedback, catálogo e consulta às APIs oficiais |
| E-mail | Nodemailer (SMTP) | Envio do feedback |
| Segurança | helmet, cors, express-rate-limit | Cabeçalhos, origens e limite de requisições |

---

## 3. Identidade visual

A paleta foi extraída da logo (círculo azul-marinho com anel neon ciano, "V" azul elétrico e letras prateadas).

| Token Tailwind | Cor | Origem na logo | Uso |
|---|---|---|---|
| `navy-950` / `900` / `800` | `#020B24` / `#041335` / `#071C4D` | Fundo do círculo | Fundo da página e dos cards |
| `cyan-400` | `#2FE0FF` | Anel neon e "Tech" | Destaques, ícones, foco |
| `brand-500` | `#1A6CFF` | "V" e "LVS" do texto | Gradiente dos botões |
| `silver-50` … `200` | `#F5F8FF` … `#CBD6EE` | Letras "L" e "S" | Textos |

- **Fontes:** Space Grotesk (títulos) e Inter (texto), carregadas do Google Fonts.
- **Classes utilitárias** (`src/assets/styles/main.css`): `.btn-primary`, `.btn-ghost`, `.container-page`, `.gradient-text`.
- A logo em alta resolução está em `src/assets/images/logo-original.png`; as versões otimizadas usadas pelo site ficam em `public/` (`logo-256.webp`, `favicon.png`, `og-image.jpg`).

---

## 4. Estrutura de pastas

```text
lvselecionetech/
├── index.html                # SEO, Open Graph, fontes
├── vite.config.js            # alias "@" e proxy /api → :3001
├── tailwind.config.js        # paleta, fontes, sombras
├── .env.example              # variáveis de ambiente (sem segredos)
├── public/                   # logo, favicon, og-image, images/produtos/
├── docs/DOCUMENTACAO.md      # este documento
├── src/
│   ├── main.js · App.vue
│   ├── router/index.js       # rotas e rolagem suave por âncora
│   ├── views/
│   │   ├── HomeView.vue      # página principal (orquestra busca/favoritos)
│   │   └── AdminView.vue     # painel de cadastro
│   ├── components/           # ver seção 5
│   ├── composables/          # useProducts, useProductSearch, useFavorites
│   ├── services/             # productService, feedbackService, affiliate
│   ├── data/products.js      # categorias, plataformas e produtos de demonstração
│   ├── utils/format.js       # formatação de preço (BRL)
│   └── assets/styles/main.css
└── server/
    ├── index.js              # API Express
    ├── lib/                  # validate.js, mailer.js, store.js
    ├── providers/            # index.js, mercadoLivre.js, shopee.js
    └── data/products.json    # catálogo gravado pelo painel
```

---

## 5. Frontend

### 5.1 Componentes

| Componente | Responsabilidade |
|---|---|
| `AppHeader` | Cabeçalho fixo: logo, menu de categorias, busca, favoritos; menu lateral no mobile; link "Pular para o conteúdo" |
| `HeroSection` | Título, subtítulo, busca em destaque e botões de ação |
| `CategoryNavigation` | Grade de atalhos para as 7 categorias |
| `CategorySection` | Seção de uma categoria (`id` = slug), com título, descrição e grade; estado vazio |
| `ProductGrid` | Grade responsiva de cards (1 coluna no celular, 2 no tablet, 4 no desktop) |
| `ProductCard` | Controla o estado "virado" e monta frente e verso |
| `ProductCardFront` / `ProductCardBack` | Faces do card |
| `BuyButton` | Botão de compra com o link de afiliado, ou botão inativo se não houver link válido |
| `AffiliateBadge` | Selo da plataforma (Shopee / Mercado Livre) |
| `ProductImage` | Imagem com carregamento tardio e placeholder por categoria |
| `ProductSearch` | Campo de busca reutilizável (header, menu móvel e hero) |
| `FeedbackForm` | Formulário de avaliação |
| `LoadingState` | Esqueleto de carregamento e mensagem de erro com "tentar novamente" |
| `AppFooter` | Rodapé com categorias, contato, avisos legais e ano automático |

### 5.2 Fluxo de dados

```text
data/products.js ─┐
                  ├─► productService.fetchProducts() ─► useProducts() ─► HomeView
API /api/products ┘                                          │
                                                             ├─► categorias (até 4 produtos cada)
                                    useProductSearch() ◄─────┘
                                    useFavorites() (localStorage)
```

- **`useProducts`** carrega os produtos, ignora os inativos (`active: false`) e agrupa por categoria.
- **`useProductSearch`** normaliza o texto (minúsculas, sem acentos, sem espaços extras) e exige que **todos** os termos digitados apareçam em título, marca, categoria, descrição ou características.
- **`useFavorites`** mantém os IDs favoritos em um estado compartilhado e os grava no `localStorage`.
- Os componentes visuais **não conhecem a origem dos dados**: trocar o arquivo local pela API é só uma variável de ambiente.

### 5.3 Card com giro (flip)

- CSS 3D em `main.css`: `perspective`, `transform-style: preserve-3d`, `backface-visibility: hidden` e `rotateY(180deg)`.
- A **área informativa** (imagem, título, preço) é um `role="button"` que gira por clique, toque, Enter ou Espaço.
- O botão **Comprar fica fora dessa área**, então nunca gira o card. O coração de favoritos também.
- A face oculta recebe `inert`, saindo da navegação por teclado e dos leitores de tela.
- Com `prefers-reduced-motion`, a rotação é trocada por uma alternância simples entre as faces.

### 5.4 Busca e favoritos

- Digitar em qualquer campo de busca (header, menu móvel, hero) atualiza o mesmo estado.
- Com busca ativa, as seções de categoria somem e aparece "N resultados para …", agrupados por categoria.
- Sem resultados: mensagem amigável. Botões **Limpar pesquisa** e **Ver todas as categorias**.
- O botão "Ver todos (N)" de uma categoria com mais de 4 produtos filtra por aquela categoria.
- O coração do cabeçalho alterna a visualização de favoritos.

### 5.5 Links de afiliado (`services/affiliate.js`)

- `validateAffiliateUrl` exige **https** e domínio de Shopee (`shopee.com.br`, `shope.ee`) ou Mercado Livre (`mercadolivre.com.br`, `mercadolivre.com`, `mercadolibre.com`, `meli.la`).
- `detectPlatform` identifica a plataforma pelo domínio; `isShortLink` marca links encurtados.
- `safeAffiliateHref` só devolve o link se for válido; caso contrário o botão fica inativo.
- Links externos usam `target="_blank"` e `rel="sponsored noopener noreferrer"`, sempre com o link de afiliado exato.

### 5.6 Acessibilidade e desempenho

- HTML semântico, rótulos em todos os campos, foco visível e mensagens de erro com `role="alert"`.
- Alvos de toque de pelo menos 44 px.
- Rolagem suave por âncora, desativada com redução de movimento.
- Imagens com `loading="lazy"`, dimensões definidas e código da rota `/admin` carregado sob demanda.

---

## 6. Modelo de dados do produto

```js
{
  id: 'monitor-001',
  title: 'Monitor 24" Full HD',
  brand: 'Marca',
  image: '/images/produtos/monitor-001.webp', // ou URL https; null = placeholder
  price: 799.9,
  previousPrice: null,        // só use se for um preço real e validado
  description: 'Texto resumido.',
  features: ['Tela de 24 polegadas', 'Resolução Full HD'],
  affiliateUrl: 'https://…',  // link de afiliado exato
  platform: 'mercado-livre',  // 'shopee' | 'mercado-livre'
  category: 'monitores',      // slug de uma das 7 categorias
  updatedAt: null,            // ISO 8601 quando aplicável
  active: true,
  demo: true                  // apenas nos exemplos; remover nos produtos reais
}
```

Categorias válidas: `monitores`, `teclados`, `mouses`, `fones-de-ouvido`, `notebooks`, `pcs`, `cadeiras-gamers`.

---

## 7. Backend (`server/`)

### 7.1 Endpoints

| Método e rota | Acesso | Função |
|---|---|---|
| `POST /api/feedback` | Público (limite de 5 envios / 15 min por IP) | Valida e envia o feedback por e-mail |
| `GET /api/products` | Público | Lista produtos ativos, ordenados por `position` |
| `POST /api/products/lookup` | Admin | Consulta a fonte oficial a partir do link |
| `GET /api/admin/products` | Admin | Lista todos os produtos do catálogo |
| `POST /api/admin/products` | Admin | Cadastra um produto |
| `PUT /api/admin/products/:id` | Admin | Atualiza um produto |
| `DELETE /api/admin/products/:id` | Admin | Remove um produto |

O acesso de admin usa o cabeçalho `Authorization: Bearer <ADMIN_TOKEN>`, comparado em tempo constante. Sem `ADMIN_TOKEN` (mínimo de 16 caracteres) configurado, esses endpoints respondem 503.

### 7.2 Feedback por e-mail

1. O frontend envia `{ rating, comment, email, website }`.
2. Se `website` (campo honeypot, invisível para pessoas) vier preenchido, o servidor responde `ok` e **não envia nada**.
3. O servidor valida (nota inteira de 1 a 5, e-mail válido) e sanitiza (remove tags e caracteres de controle, limita tamanho).
4. Sem SMTP configurado, responde **503**; a mensagem de sucesso nunca aparece sem confirmação real.
5. O e-mail enviado escapa HTML. O e-mail do visitante vai em `Reply-To`, e o destinatário vem de `FEEDBACK_TO_EMAIL`.
6. O sucesso (HTTP 200) só é devolvido depois que o SMTP aceita a mensagem.

### 7.3 Consulta a fontes oficiais (`providers/`)

Fluxo do painel:

```text
link de afiliado ─► detectar plataforma ─► link curto? ─► sim: pedir URL original / cadastro manual
                                           │
                                           └► não: provider configurado? ─► não: cadastro manual
                                                                           └► sim: consulta API oficial
                                                                                 └► falhou ou faltou dado: completar manualmente
```

- **Mercado Livre:** API oficial (`api.mercadolibre.com`) com `ML_CLIENT_ID` e `ML_CLIENT_SECRET`.
- **Shopee:** Affiliate Open API com `SHOPEE_APP_ID` e `SHOPEE_APP_SECRET`.
- **Não há scraping** nem contorno de bloqueios. Em qualquer falha, o administrador preenche o formulário manualmente.
- A resposta traz `missing` (campos não obtidos), usado para destacar campos no formulário.

> **Atenção:** os dois providers seguem a documentação pública conhecida, mas **não foram testados com credenciais reais**. Confira a documentação oficial atual de cada programa antes de depender deles.

### 7.4 Armazenamento

Os produtos cadastrados pelo painel ficam em `server/data/products.json`, com gravação atômica (arquivo temporário e renomeação). É suficiente para um catálogo pequeno; para crescer, substitua `server/lib/store.js` por um banco de dados mantendo as funções `readProducts` e `writeProducts`.

---

## 8. Segurança

| Medida | Onde |
|---|---|
| Segredos só no servidor (`.env`); variáveis `VITE_*` são públicas | `.env.example` |
| Cabeçalhos de segurança e CSP | `helmet` em `server/index.js` |
| CORS restrito por `CORS_ORIGINS` | `server/index.js` |
| Limite de requisições (feedback e admin) | `express-rate-limit` |
| Corpo JSON limitado a 20 KB | `express.json` |
| Validação, sanitização e escape de HTML | `server/lib/validate.js`, `mailer.js` |
| Honeypot anti-spam | `FeedbackForm.vue` e `/api/feedback` |
| Links de afiliado só `https` e de domínios aceitos | frontend e backend |
| Token de admin comparado em tempo constante | `requireAdmin` |

---

## 9. Variáveis de ambiente

Copie `.env.example` para `.env`. **Nunca faça commit do `.env`.**

**Frontend (públicas):**

| Variável | Função |
|---|---|
| `VITE_PUBLIC_CONTACT_EMAIL` | E-mail exibido no rodapé (opcional) |
| `VITE_API_BASE_URL` | URL base da API; vazio usa a mesma origem |
| `VITE_USE_API` | `true` lista produtos de `/api/products`; `false` usa `src/data/products.js` |

**Backend (segredos):**

| Variável | Função |
|---|---|
| `PORT` | Porta da API (padrão 3001) |
| `CORS_ORIGINS` | Origens permitidas, separadas por vírgula |
| `TRUST_PROXY` | `1` quando atrás de proxy/PaaS |
| `SERVE_STATIC` | `true` para o backend servir a pasta `dist/` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Configuração do e-mail |
| `FEEDBACK_TO_EMAIL` | E-mail administrativo que recebe os feedbacks |
| `ADMIN_TOKEN` | Token do painel (gere com `openssl rand -hex 32`) |
| `ML_CLIENT_ID`, `ML_CLIENT_SECRET` | Credenciais do Mercado Livre |
| `SHOPEE_APP_ID`, `SHOPEE_APP_SECRET` | Credenciais da Shopee |

---

## 10. Como executar

```bash
npm install
cp .env.example .env
npm run dev          # frontend: http://localhost:5173
npm run server:dev   # backend:  http://localhost:3001 (o Vite repassa /api)
npm run build        # gera dist/
npm run preview      # testa o build
```

O frontend funciona sozinho com os dados de demonstração. O backend só é necessário para feedback e painel `/admin`.

---

## 11. Como cadastrar produtos

### Opção A — editar o arquivo

Edite `src/data/products.js`: troque os itens de exemplo por produtos reais (modelo na seção 6), coloque as imagens em `public/images/produtos/` e informe o `affiliateUrl`. A ordem do array define a ordem de exibição, e cada categoria mostra até 4 produtos. Para adicionar, remover ou reordenar, basta editar a lista; os componentes não mudam.

### Opção B — painel `/admin`

1. Configure `ADMIN_TOKEN` e `VITE_USE_API=true`; inicie frontend e backend.
2. Abra `/admin` e informe o token.
3. Cole o link de afiliado (e a URL original do produto, se o link for encurtado) e clique em **Buscar dados**, ou em **Cadastrar manualmente**.
4. Revise os campos (os não obtidos aparecem destacados), escolha a categoria e clique em **Confirmar e publicar**.
5. Para remover, use o ícone de lixeira na lista de produtos publicados.

---

## 12. Publicação

**Opção 1 — um único serviço** (Render, Railway, VPS): rode `npm run build` e inicie com `SERVE_STATIC=true npm run server`. Defina `TRUST_PROXY=1` atrás de proxy e as demais variáveis do backend.

**Opção 2 — frontend estático e API separados:**
- Publique `dist/` em Netlify, Vercel ou Cloudflare Pages, com fallback de todas as rotas para `index.html`.
- Publique a API em outro host; defina `VITE_API_BASE_URL` **no momento do build** e `CORS_ORIGINS` na API.
- O arquivo `server/data/products.json` precisa de disco persistente; em hospedagens sem disco persistente, use um banco de dados.

---

## 13. Pendências antes de ir ao ar

- [ ] Substituir os 28 produtos de demonstração por produtos reais com links de afiliado.
- [ ] Configurar SMTP e `FEEDBACK_TO_EMAIL`, e testar o envio de um feedback real.
- [ ] Revisar com orientação jurídica os textos de privacidade, termos e aviso de afiliados do rodapé (são modelos) e as regras de cada programa de afiliados.
- [ ] Testar os providers da Shopee e do Mercado Livre com credenciais reais.
- [ ] Definir `ADMIN_TOKEN` forte e, se possível, restringir o acesso a `/admin`.
- [ ] Adicionar imagens reais dos produtos (WebP/AVIF).
- [ ] Opcional: migrar de `lucide-vue-next` (marcado como obsoleto no npm) para `@lucide/vue`.

---

## 14. Decisões de projeto

- **Sem dados inventados:** preços, links e avaliações de demonstração são sinalizados com o selo "Demonstração", e o botão de compra fica inativo sem link válido.
- **Sem scraping:** só APIs oficiais ou cadastro manual, para respeitar as regras das plataformas.
- **Segredos fora do frontend:** consulta às APIs e envio de e-mail passam pelo backend.
- **Dados separados da interface:** trocar a origem dos produtos não exige mexer nos componentes.
- **Expansão futura:** novas categorias entram em `CATEGORIES` (`src/data/products.js`) e na lista `CATEGORY_IDS` do servidor.
