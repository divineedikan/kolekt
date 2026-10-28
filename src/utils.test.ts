import { describe, expect, it } from 'vitest'
import { balanceOf, dueState, inDays, trustOf, waNumber } from './utils'
import { reminderText } from './templates'
import type { Customer, Debt, Settings } from './store'

const debt = (over: Partial<Debt> = {}): Debt => ({
  id: 'd1',
  customerId: 'c1',
  item: 'Ankara gown',
  amount: 15000,
  dueDate: inDays(3),
  createdAt: new Date().toISOString(),
  payments: [],
  remindersSent: 0,
  ...over,
})
const customer: Customer = { id: 'c1', name: 'Chioma Obi', phone: '0803 123 4567', createdAt: '' }
const settings: Settings = { businessName: "Ada's Closet", payLink: 'https://paystack.shop/pay/ada', bankDetails: '', lang: 'en', footer: true, onboarded: true }

describe('waNumber', () => {
  it('normalises Nigerian formats', () => {
    expect(waNumber('0803 123 4567')).toBe('2348031234567')
    expect(waNumber('+234 803 123 4567')).toBe('2348031234567')
    expect(waNumber('8031234567')).toBe('2348031234567')
  })
})

describe('debts', () => {
  it('computes balance with partial payments', () => {
    expect(balanceOf(debt({ payments: [{ id: 'p', amount: 5000, method: 'cash', date: '' }] }))).toBe(10000)
  })
  it('classifies due state', () => {
    expect(dueState(debt({ dueDate: inDays(-2) }))).toBe('overdue')
    expect(dueState(debt({ dueDate: inDays(0) }))).toBe('today')
    expect(dueState(debt({ dueDate: inDays(10) }))).toBe('later')
  })
})

describe('trust score', () => {
  it('rewards on-time payers and flags late ones', () => {
    const onTime = debt({ dueDate: inDays(5), payments: [{ id: 'p', amount: 15000, method: 'paystack', date: new Date().toISOString() }] })
    expect(trustOf(customer, [onTime]).tone).toBe('good')
    expect(trustOf(customer, [debt({ dueDate: inDays(-4) })]).tone).toBe('bad')
    expect(trustOf(customer, []).tone).toBe('new')
  })
})

describe('reminder text', () => {
  it('includes first name, balance, pay link and Pidgin variant', () => {
    const en = reminderText(debt(), customer, settings, 'friendly', 'en')
    expect(en).toContain('Chioma')
    expect(en).toContain('₦15,000')
    expect(en).toContain('https://paystack.shop/pay/ada')
    expect(en).toContain('Reference: KL-D1')
    expect(reminderText(debt(), customer, settings, 'firm', 'pcm')).toContain('Abeg')
  })
})
