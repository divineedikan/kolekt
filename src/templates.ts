import type { Customer, Debt, Lang, Settings, Tone } from './store'
import { balanceOf, debtRef, dueState, naira, prettyDate } from './utils'

interface Ctx {
  name: string
  biz: string
  bal: string
  item: string
  date: string
  late: boolean
}

type Template = (c: Ctx) => string

const T: Record<Lang, Record<Tone, Template>> = {
  en: {
    friendly: (c) =>
      `Hi ${c.name} 👋, this is ${c.biz}. Just a gentle reminder that ${c.bal} for ${c.item} ${c.late ? 'was due on' : 'is due on'} ${c.date}. Thank you for your patronage! 🙏`,
    firm: (c) =>
      `Hello ${c.name}, ${c.biz} here. Your balance of ${c.bal} for ${c.item} ${c.late ? 'was due on' : 'is due on'} ${c.date}. Please make payment today. Thank you.`,
    final: (c) =>
      `Dear ${c.name}, this is a final reminder from ${c.biz}. ${c.bal} for ${c.item} has been outstanding since ${c.date}. Kindly pay now or tell me when you will pay.`,
  },
  pcm: {
    friendly: (c) =>
      `Hello ${c.name} 👋, na ${c.biz} dey talk. Small reminder say ${c.bal} for ${c.item} ${c.late ? 'don due since' : 'go due on'} ${c.date}. Thank you well well! 🙏`,
    firm: (c) =>
      `${c.name}, na ${c.biz}. The ${c.bal} for ${c.item} ${c.late ? 'don pass the date' : 'go due'} (${c.date}). Abeg pay am today. Thank you.`,
    final: (c) =>
      `${c.name}, this na last reminder from ${c.biz}. ${c.bal} for ${c.item} don dey since ${c.date}. Abeg pay now or tell me the exact day you go pay.`,
  },
}

export const toneNames: Record<Tone, string> = { friendly: 'Friendly', firm: 'Firm', final: 'Final' }

export function payBlock(s: Settings, lang: Lang) {
  if (s.payLink) return lang === 'pcm' ? `\n\nPay sharp sharp here 👉 ${s.payLink}` : `\n\nPay securely here 👉 ${s.payLink}`
  if (s.bankDetails) return lang === 'pcm' ? `\n\nAccount: ${s.bankDetails}` : `\n\nBank details: ${s.bankDetails}`
  return ''
}

const footer = '\n\n— sent with Kolekt'

export function reminderText(debt: Debt, customer: Customer, s: Settings, tone: Tone, lang: Lang) {
  const ctx: Ctx = {
    name: customer.name.split(' ')[0],
    biz: s.businessName || 'your vendor',
    bal: naira(balanceOf(debt)),
    item: debt.item,
    date: prettyDate(debt.dueDate),
    late: dueState(debt) === 'overdue',
  }
  const ref = lang === 'pcm' ? `\nRef: ${debtRef(debt)}` : `\nReference: ${debtRef(debt)}`
  return T[lang][tone](ctx) + ref + payBlock(s, lang) + (s.footer ? footer : '')
}

export function statementText(customer: Customer, debts: Debt[], s: Settings) {
  const open = debts.filter((d) => balanceOf(d) > 0)
  const lines = open.map((d) => `• ${d.item}: ${naira(balanceOf(d))} (due ${prettyDate(d.dueDate)}, ${debtRef(d)})`)
  const total = open.reduce((a, d) => a + balanceOf(d), 0)
  return (
    `Statement from ${s.businessName || 'your vendor'} for ${customer.name}\n\n` +
    (lines.length ? lines.join('\n') : 'Nothing outstanding 🎉') +
    `\n\nTotal balance: ${naira(total)}` +
    payBlock(s, s.lang) +
    (s.footer ? footer : '')
  )
}
