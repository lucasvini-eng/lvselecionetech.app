const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

/**
 * Envia o feedback ao backend, que o encaminha ao e-mail administrativo.
 * Só resolve quando o servidor confirmar o recebimento (HTTP 2xx).
 */
export async function sendFeedback({ rating, comment, email, website }) {
  let res
  try {
    res = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // `website` é o campo honeypot (deve ir vazio)
      body: JSON.stringify({ rating, comment, email, website })
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* sem corpo */
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Muitos envios em pouco tempo. Aguarde alguns minutos e tente de novo.')
    }
    throw new Error(data?.error || 'Não foi possível enviar seu feedback agora.')
  }
  return data
}
