/**
 * DADOS DE DEMONSTRAÇÃO
 * ---------------------------------------------------------------
 * Todos os produtos abaixo são EXEMPLOS (demo: true) para permitir o
 * desenvolvimento visual. Preços, títulos e características NÃO
 * correspondem a produtos reais e `affiliateUrl` está vazio de propósito.
 *
 * Para publicar produtos reais:
 *   1. Substitua/edite os itens (ou use o painel/endpoint de importação).
 *   2. Informe o `affiliateUrl` real e remova `demo: true`.
 *   3. `image`: caminho em /public/images/produtos/ ou URL autorizada.
 *
 * Ordem do array = ordem de exibição dentro da categoria.
 */

export const PLATFORMS = {
  shopee: { id: 'shopee', name: 'Shopee', buyLabel: 'Comprar na Shopee' },
  'mercado-livre': {
    id: 'mercado-livre',
    name: 'Mercado Livre',
    buyLabel: 'Comprar no Mercado Livre'
  }
}

export const CATEGORIES = [
  {
    id: 'monitores',
    name: 'Monitores',
    icon: 'Monitor',
    description: 'Telas para jogos, trabalho e criação, de entrada a alto desempenho.'
  },
  {
    id: 'teclados',
    name: 'Teclados',
    icon: 'Keyboard',
    description: 'Mecânicos, sem fio e compactos para digitar e jogar com conforto.'
  },
  {
    id: 'mouses',
    name: 'Mouses',
    icon: 'Mouse',
    description: 'Precisão e ergonomia para o dia a dia e para as partidas.'
  },
  {
    id: 'fones-de-ouvido',
    name: 'Fones de Ouvido',
    icon: 'Headphones',
    description: 'Headsets e fones para reuniões, música e imersão total.'
  },
  {
    id: 'notebooks',
    name: 'Notebooks',
    icon: 'Laptop',
    description: 'Portáteis para estudar, trabalhar e criar em qualquer lugar.'
  },
  {
    id: 'pcs',
    name: 'PCs',
    icon: 'Cpu',
    description: 'Computadores prontos para produtividade, jogos e criação.'
  },
  {
    id: 'cadeiras-gamers',
    name: 'Cadeiras Gamers',
    icon: 'Armchair',
    description: 'Conforto e suporte para longas horas de uso no setup.'
  }
]

const demoDescription = 'Item de demonstração. Substitua pelos dados reais do produto cadastrado.'

function demo(id, category, platform, title, price, previousPrice, brand, features) {
  return {
    id,
    title,
    brand,
    image: null, // sem imagem real: o card exibe um placeholder da categoria
    price,
    previousPrice,
    description: demoDescription,
    features,
    affiliateUrl: '', // preencher com o link de afiliado real
    platform,
    category,
    updatedAt: null,
    active: true,
    demo: true
  }
}

export const products = [
  // ---- Monitores ----
  demo('monitor-001', 'monitores', 'mercado-livre', 'Monitor 24" Full HD (exemplo 1)', 799.9, 899.9, 'Marca Exemplo', [
    'Tela de 24 polegadas',
    'Resolução Full HD',
    'Taxa de atualização conforme o modelo'
  ]),
  demo('monitor-002', 'monitores', 'shopee', 'Monitor 27" QHD (exemplo 2)', 1299.9, null, 'Marca Exemplo', [
    'Tela de 27 polegadas',
    'Resolução QHD',
    'Painel IPS (a confirmar)'
  ]),
  demo('monitor-003', 'monitores', 'mercado-livre', 'Monitor Curvo 32" (exemplo 3)', 1699.9, 1899.9, 'Marca Exemplo', [
    'Tela curva de 32 polegadas',
    'Ideal para multitarefa',
    'Entradas conforme o modelo'
  ]),
  demo('monitor-004', 'monitores', 'shopee', 'Monitor Portátil 15" (exemplo 4)', 649.9, null, 'Marca Exemplo', [
    'Tela portátil de 15 polegadas',
    'Conexão USB-C (a confirmar)',
    'Leve para transportar'
  ]),

  // ---- Teclados ----
  demo('teclado-001', 'teclados', 'shopee', 'Teclado Mecânico TKL (exemplo 1)', 249.9, 299.9, 'Marca Exemplo', [
    'Formato TKL compacto',
    'Switches mecânicos',
    'Iluminação conforme o modelo'
  ]),
  demo('teclado-002', 'teclados', 'mercado-livre', 'Teclado Sem Fio 75% (exemplo 2)', 389.9, null, 'Marca Exemplo', [
    'Layout 75%',
    'Conexão Bluetooth e 2.4 GHz (a confirmar)',
    'Bateria recarregável'
  ]),
  demo('teclado-003', 'teclados', 'shopee', 'Teclado Membrana Slim (exemplo 3)', 89.9, 119.9, 'Marca Exemplo', [
    'Teclas de perfil baixo',
    'Digitação silenciosa',
    'Teclado numérico completo'
  ]),
  demo('teclado-004', 'teclados', 'mercado-livre', 'Teclado Mecânico 60% (exemplo 4)', 329.9, null, 'Marca Exemplo', [
    'Formato 60% ultracompacto',
    'Hot-swap (a confirmar)',
    'Cabo destacável'
  ]),

  // ---- Mouses ----
  demo('mouse-001', 'mouses', 'mercado-livre', 'Mouse Gamer 12000 DPI (exemplo 1)', 129.9, 159.9, 'Marca Exemplo', [
    'Sensor óptico de alta precisão',
    'Botões programáveis',
    'Iluminação RGB'
  ]),
  demo('mouse-002', 'mouses', 'shopee', 'Mouse Sem Fio Ergonômico (exemplo 2)', 99.9, null, 'Marca Exemplo', [
    'Conexão sem fio',
    'Formato ergonômico',
    'Uso diário no escritório'
  ]),
  demo('mouse-003', 'mouses', 'mercado-livre', 'Mouse Ultraleve (exemplo 3)', 219.9, 249.9, 'Marca Exemplo', [
    'Corpo ultraleve',
    'Pés de deslizamento suave',
    'Ideal para jogos competitivos'
  ]),
  demo('mouse-004', 'mouses', 'shopee', 'Mouse Vertical (exemplo 4)', 79.9, null, 'Marca Exemplo', [
    'Design vertical',
    'Reduz a tensão no pulso',
    'Conexão conforme o modelo'
  ]),

  // ---- Fones de Ouvido ----
  demo('fone-001', 'fones-de-ouvido', 'shopee', 'Headset Gamer 7.1 (exemplo 1)', 189.9, 229.9, 'Marca Exemplo', [
    'Som surround virtual',
    'Microfone retrátil',
    'Almofadas confortáveis'
  ]),
  demo('fone-002', 'fones-de-ouvido', 'mercado-livre', 'Fone Bluetooth com ANC (exemplo 2)', 449.9, null, 'Marca Exemplo', [
    'Cancelamento de ruído (a confirmar)',
    'Conexão Bluetooth',
    'Bateria de longa duração'
  ]),
  demo('fone-003', 'fones-de-ouvido', 'shopee', 'Fone In-Ear TWS (exemplo 3)', 119.9, 149.9, 'Marca Exemplo', [
    'Fones intra-auriculares sem fio',
    'Estojo de carregamento',
    'Resistência à água (a confirmar)'
  ]),
  demo('fone-004', 'fones-de-ouvido', 'mercado-livre', 'Headset USB para Escritório (exemplo 4)', 159.9, null, 'Marca Exemplo', [
    'Microfone com redução de ruído',
    'Conexão USB',
    'Ideal para reuniões'
  ]),

  // ---- Notebooks ----
  demo('notebook-001', 'notebooks', 'mercado-livre', 'Notebook 15,6" para Estudos (exemplo 1)', 2799.9, 2999.9, 'Marca Exemplo', [
    'Tela de 15,6 polegadas',
    'Armazenamento SSD (a confirmar)',
    'Indicado para estudo e trabalho'
  ]),
  demo('notebook-002', 'notebooks', 'shopee', 'Notebook Gamer 16" (exemplo 2)', 5499.9, null, 'Marca Exemplo', [
    'Placa de vídeo dedicada (a confirmar)',
    'Tela de alta taxa de atualização',
    'Sistema de refrigeração reforçado'
  ]),
  demo('notebook-003', 'notebooks', 'mercado-livre', 'Ultrabook 14" Leve (exemplo 3)', 3799.9, 4099.9, 'Marca Exemplo', [
    'Design fino e leve',
    'Tela de 14 polegadas',
    'Boa autonomia de bateria'
  ]),
  demo('notebook-004', 'notebooks', 'shopee', 'Notebook 2 em 1 Touch (exemplo 4)', 3299.9, null, 'Marca Exemplo', [
    'Tela sensível ao toque',
    'Dobradiça 360°',
    'Compatível com caneta (a confirmar)'
  ]),

  // ---- PCs ----
  demo('pc-001', 'pcs', 'mercado-livre', 'PC Desktop para Escritório (exemplo 1)', 2299.9, null, 'Marca Exemplo', [
    'Processador de entrada',
    'SSD para boot rápido',
    'Ideal para tarefas do dia a dia'
  ]),
  demo('pc-002', 'pcs', 'shopee', 'PC Gamer Intermediário (exemplo 2)', 4999.9, 5399.9, 'Marca Exemplo', [
    'Placa de vídeo dedicada (a confirmar)',
    'Gabinete com ventilação',
    'Pronto para jogos em Full HD'
  ]),
  demo('pc-003', 'pcs', 'mercado-livre', 'Mini PC Compacto (exemplo 3)', 1899.9, null, 'Marca Exemplo', [
    'Formato mini',
    'Baixo consumo de energia',
    'Suporta montagem VESA (a confirmar)'
  ]),
  demo('pc-004', 'pcs', 'shopee', 'PC para Edição e Criação (exemplo 4)', 6899.9, 7399.9, 'Marca Exemplo', [
    'Mais memória RAM',
    'Armazenamento NVMe',
    'Voltado para criação de conteúdo'
  ]),

  // ---- Cadeiras Gamers ----
  demo('cadeira-001', 'cadeiras-gamers', 'shopee', 'Cadeira Gamer Reclinável (exemplo 1)', 899.9, 1049.9, 'Marca Exemplo', [
    'Encosto reclinável',
    'Apoio de braços ajustável',
    'Almofadas de pescoço e lombar'
  ]),
  demo('cadeira-002', 'cadeiras-gamers', 'mercado-livre', 'Cadeira Ergonômica de Malha (exemplo 2)', 1299.9, null, 'Marca Exemplo', [
    'Encosto em malha respirável',
    'Suporte lombar',
    'Regulagem de altura'
  ]),
  demo('cadeira-003', 'cadeiras-gamers', 'shopee', 'Cadeira Gamer com Apoio de Pés (exemplo 3)', 1099.9, null, 'Marca Exemplo', [
    'Apoio de pés retrátil',
    'Revestimento sintético',
    'Base reforçada'
  ]),
  demo('cadeira-004', 'cadeiras-gamers', 'mercado-livre', 'Cadeira Gamer Compacta (exemplo 4)', 699.9, 799.9, 'Marca Exemplo', [
    'Tamanho compacto',
    'Estofado macio',
    'Rodízios silenciosos'
  ])
]
