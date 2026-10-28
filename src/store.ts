import { useSyncExternalStore } from 'react'

// All data lives on the seller's phone (localStorage). Cloud sync is a Pro feature for later.

export type Lang = 'en' | 'pcm'
export type Tone = 'friendly' | 'firm' | 'final'

export interface Customer {
  id: string
  name: string
  phone: string // as typed; normalised when building wa.me links
  note?: string
  createdAt: string
}

export interface Payment {
  id: string
  amount: number
  method: 'paystack' | 'transfer' | 'cash' | 'pos'
  date: string // ISO
}

export interface Debt {
  id: string
  customerId: string
  item: string
  amount: number
  dueDate: string // YYYY-MM-DD
  createdAt: string
  payments: Payment[]
  remindersSent: number
  lastRemindedAt?: string
  note?: string
}

export interface Settings {
  businessName: string
  payLink: string // seller's own payment link (any provider)
  bankDetails: string // fallback when the seller has no payment link yet
  lang: Lang
  footer: boolean
  onboarded: boolean
  demo?: boolean // true while sample data is loaded
  logo?: string // small data URL shown on receipts (Pro)
}

export interface State {
  customers: Customer[]
  debts: Debt[]
  settings: Settings
}

const KEY = 'kolekt:v1'

const defaultState: State = {
  customers: [],
  debts: [],
  settings: {
    businessName: '',
    payLink: '',
    bankDetails: '',
    lang: 'en',
    footer: true,
    onboarded: false,
  },
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<State>
    return { ...defaultState, ...parsed, settings: { ...defaultState.settings, ...parsed.settings } }
  } catch {
    return defaultState
  }
}

let state: State = load()
const listeners = new Set<() => void>()

function commit(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked: keep working in memory for this session.
  }
  listeners.forEach((l) => l())
}

// Lets non-React code (cloud sync) react to every change.
export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useStore(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

export const actions = {
  updateSettings(patch: Partial<Settings>) {
    commit({ ...state, settings: { ...state.settings, ...patch } })
  },
  addCustomer(c: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const customer = { ...c, id: uid(), createdAt: new Date().toISOString() }
    commit({ ...state, customers: [...state.customers, customer] })
    return customer
  },
  updateCustomer(id: string, patch: Partial<Customer>) {
    commit({ ...state, customers: state.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  },
  deleteCustomer(id: string) {
    commit({
      ...state,
      customers: state.customers.filter((c) => c.id !== id),
      debts: state.debts.filter((d) => d.customerId !== id),
    })
  },
  addDebt(d: Omit<Debt, 'id' | 'createdAt' | 'payments' | 'remindersSent'>, paidNow = 0, method: Payment['method'] = 'cash'): Debt {
    const debt: Debt = {
      ...d,
      id: uid(),
      createdAt: new Date().toISOString(),
      payments: paidNow > 0 ? [{ id: uid(), amount: paidNow, method, date: new Date().toISOString() }] : [],
      remindersSent: 0,
    }
    commit({ ...state, debts: [debt, ...state.debts] })
    return debt
  },
  addPayment(debtId: string, amount: number, method: Payment['method']) {
    commit({
      ...state,
      debts: state.debts.map((d) =>
        d.id === debtId ? { ...d, payments: [...d.payments, { id: uid(), amount, method, date: new Date().toISOString() }] } : d,
      ),
    })
  },
  markReminded(debtId: string) {
    commit({
      ...state,
      debts: state.debts.map((d) =>
        d.id === debtId ? { ...d, remindersSent: d.remindersSent + 1, lastRemindedAt: new Date().toISOString() } : d,
      ),
    })
  },
  updateDebt(id: string, patch: Partial<Debt>) {
    commit({ ...state, debts: state.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)) })
  },
  deleteDebt(id: string) {
    commit({ ...state, debts: state.debts.filter((d) => d.id !== id) })
  },
  replaceAll(next: State) {
    commit({ ...defaultState, ...next, settings: { ...defaultState.settings, ...next.settings } })
  },
  snapshot: () => state,
}
