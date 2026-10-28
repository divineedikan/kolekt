import { actions, type State } from './store'
import { inDays } from './utils'

// Sample shop so a new visitor can see every feature before typing anything.
export function loadDemo() {
  const ago = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
  const pay = (id: string, amount: number, method: 'paystack' | 'transfer' | 'cash', date: string) => ({ id, amount, method, date })
  const state: State = {
    customers: [
      { id: 'demo-c1', name: 'Chioma Obi', phone: '08031234567', createdAt: ago(40) },
      { id: 'demo-c2', name: 'Tunde Bakare', phone: '08051112222', createdAt: ago(30) },
      { id: 'demo-c3', name: 'Blessing Okon', phone: '07063334444', createdAt: ago(25) },
      { id: 'demo-c4', name: 'Emeka Nwosu', phone: '09025556666', createdAt: ago(12) },
      { id: 'demo-c5', name: 'Aisha Bello', phone: '08137778888', createdAt: ago(5) },
    ],
    debts: [
      { id: 'demo-d1', customerId: 'demo-c1', item: '2 Ankara gowns', amount: 15000, dueDate: inDays(2), createdAt: ago(5), payments: [pay('p1', 5000, 'cash', ago(5))], remindersSent: 0 },
      { id: 'demo-d2', customerId: 'demo-c2', item: 'iPhone charger + case', amount: 12500, dueDate: inDays(-3), createdAt: ago(10), payments: [], remindersSent: 1, lastRemindedAt: ago(2) },
      { id: 'demo-d3', customerId: 'demo-c3', item: 'Small chops tray (50 pcs)', amount: 25000, dueDate: inDays(0), createdAt: ago(7), payments: [pay('p2', 10000, 'transfer', ago(6))], remindersSent: 0 },
      { id: 'demo-d4', customerId: 'demo-c1', item: 'Lace blouse', amount: 9000, dueDate: ago(20).slice(0, 10), createdAt: ago(30), payments: [pay('p3', 9000, 'paystack', ago(21))], remindersSent: 0 },
      { id: 'demo-d5', customerId: 'demo-c4', item: 'Perfume set', amount: 18000, dueDate: inDays(-9), createdAt: ago(12), payments: [pay('p4', 4000, 'cash', ago(12))], remindersSent: 2, lastRemindedAt: ago(4) },
      { id: 'demo-d6', customerId: 'demo-c5', item: 'Hair (Brazilian, 18")', amount: 45000, dueDate: inDays(10), createdAt: ago(1), payments: [pay('p5', 20000, 'transfer', ago(1))], remindersSent: 0 },
    ],
    settings: {
      businessName: "Ada's Closet (demo)",
      payLink: 'https://paystack.shop/pay/demo',
      bankDetails: '',
      lang: 'en',
      footer: true,
      onboarded: true,
      demo: true,
    },
  }
  actions.replaceAll(state)
}

export function clearDemo() {
  actions.replaceAll({
    customers: [],
    debts: [],
    settings: { businessName: '', payLink: '', bankDetails: '', lang: 'en', footer: true, onboarded: false, demo: false },
  })
}
