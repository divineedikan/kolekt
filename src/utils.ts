import type { Customer, Debt } from './store'

export const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG')

export const paidOf = (d: Debt) => d.payments.reduce((s, p) => s + p.amount, 0)
export const balanceOf = (d: Debt) => Math.max(0, d.amount - paidOf(d))
export const isSettled = (d: Debt) => balanceOf(d) === 0

// Short code the seller and customer can quote, e.g. "KL-3F9A".
export const debtRef = (d: Debt) => 'KL-' + d.id.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase()

export const todayISO = () => toISODate(new Date())

export function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysUntil(isoDate: string) {
  const a = new Date(todayISO() + 'T00:00:00')
  const b = new Date(isoDate + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export type DueState = 'paid' | 'overdue' | 'today' | 'soon' | 'later'

export function dueState(d: Debt): DueState {
  if (isSettled(d)) return 'paid'
  const n = daysUntil(d.dueDate)
  if (n < 0) return 'overdue'
  if (n === 0) return 'today'
  if (n <= 3) return 'soon'
  return 'later'
}

export function dueLabel(d: Debt) {
  const s = dueState(d)
  if (s === 'paid') return 'Paid'
  const n = daysUntil(d.dueDate)
  if (n < 0) return `${-n} day${n === -1 ? '' : 's'} late`
  if (n === 0) return 'Due today'
  if (n === 1) return 'Due tomorrow'
  return `Due in ${n} days`
}

export function prettyDate(iso: string) {
  return new Date(iso.length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Nigerian numbers: 0803..., +234803..., 234803..., 803... -> 234803...
export function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('0')) return '234' + digits.slice(1)
  if (digits.length === 10) return '234' + digits
  return digits
}

export const waLink = (phone: string, text: string) =>
  `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`

export interface Trust {
  label: string
  tone: 'good' | 'ok' | 'bad' | 'new'
  onTimePct: number | null
}

// Share of settled debts whose last payment landed on or before the due date.
export function trustOf(customer: Customer, debts: Debt[]): Trust {
  const settled = debts.filter((d) => d.customerId === customer.id && isSettled(d) && d.payments.length)
  const lateOpen = debts.filter((d) => d.customerId === customer.id && dueState(d) === 'overdue').length
  if (settled.length === 0 && lateOpen === 0) return { label: 'New customer', tone: 'new', onTimePct: null }
  const onTime = settled.filter((d) => {
    const last = d.payments[d.payments.length - 1].date.slice(0, 10)
    return last <= d.dueDate
  }).length
  const total = settled.length + lateOpen
  const pct = Math.round((onTime / total) * 100)
  if (pct >= 80) return { label: 'Pays on time', tone: 'good', onTimePct: pct }
  if (pct >= 50) return { label: 'Sometimes late', tone: 'ok', onTimePct: pct }
  return { label: 'Often late', tone: 'bad', onTimePct: pct }
}

export function nextFriday() {
  const d = new Date()
  const add = (5 - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + add)
  return toISODate(d)
}

export function inDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export function monthEnd() {
  const d = new Date()
  return toISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}
