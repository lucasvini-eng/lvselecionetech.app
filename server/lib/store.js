import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILE = process.env.PRODUCTS_FILE || path.resolve(__dirname, '../data/products.json')

/**
 * Armazenamento simples em arquivo JSON (suficiente para um catálogo pequeno).
 * Para escalar, troque por um banco (SQLite/Postgres) mantendo esta interface.
 */
export async function readProducts() {
  try {
    const raw = await fs.readFile(FILE, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch (e) {
    if (e.code === 'ENOENT') return []
    throw e
  }
}

export async function writeProducts(list) {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  const tmp = `${FILE}.tmp`
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), 'utf8')
  await fs.rename(tmp, FILE) // gravação atômica
}
