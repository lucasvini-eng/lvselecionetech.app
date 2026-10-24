const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/

/** Remove caracteres de controle e tags básicas; limita o tamanho. */
export function sanitizeText(value, max = 1000) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, max)
}

/** Escapa HTML para uso em corpo de e-mail HTML. */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Valida e sanitiza o payload de feedback. */
export function parseFeedback(body) {
  const errors = []
  const rating = Number(body?.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push('A nota deve ser um número inteiro de 1 a 5.')
  }

  const comment = sanitizeText(body?.comment, 1000)
  if (typeof body?.comment === 'string' && body.comment.length > 1200) {
    errors.push('O comentário é muito longo.')
  }

  const email = sanitizeText(body?.email, 254)
  if (email && !EMAIL_RE.test(email)) errors.push('E-mail inválido.')

  return { ok: errors.length === 0, errors, value: { rating, comment, email } }
}

/** Valida URL https. */
export function isHttpsUrl(value) {
  try {
    return new URL(String(value)).protocol === 'https:'
  } catch {
    return false
  }
}
