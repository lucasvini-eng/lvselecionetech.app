import nodemailer from 'nodemailer'
import { escapeHtml } from './validate.js'

let transporter = null

export function isMailConfigured() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FEEDBACK_TO_EMAIL } = process.env
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && FEEDBACK_TO_EMAIL)
}

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  }
  return transporter
}

/** Envia o feedback ao e-mail administrativo. Lança erro se o SMTP recusar. */
export async function sendFeedbackMail({ rating, comment, email }) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const when = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  const text = [
    `Nota: ${rating}/5 (${stars})`,
    `E-mail para resposta: ${email || '(não informado)'}`,
    '',
    comment || '(sem comentário)',
    '',
    `Recebido em ${when}`
  ].join('\n')

  const html = `
    <h2>Novo feedback — LVSelecioneTech</h2>
    <p><strong>Nota:</strong> ${rating}/5 ${stars}</p>
    <p><strong>E-mail para resposta:</strong> ${email ? escapeHtml(email) : '<em>não informado</em>'}</p>
    <p style="white-space:pre-wrap">${comment ? escapeHtml(comment) : '<em>sem comentário</em>'}</p>
    <p style="color:#666;font-size:12px">Recebido em ${escapeHtml(when)}</p>`

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: process.env.FEEDBACK_TO_EMAIL,
    // e-mail do visitante já validado e sem quebras de linha (evita header injection)
    replyTo: email || undefined,
    subject: `Feedback LVSelecioneTech — ${rating}/5`,
    text,
    html
  })
}
