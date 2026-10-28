import { useState } from 'react'
import { actions, useStore, type Debt, type Payment } from '../store'
import { balanceOf, daysUntil, dueState, inDays, naira, paidOf, prettyDate } from '../utils'
import { BottomNav, DebtRow, DueBadge, Empty, Fab, Header, Sheet, toast } from '../components'
import { go } from '../router'
import { RemindSheet } from './Remind'
import { receiptImage, shareImage } from '../receipt'

const filters = [
  { key: 'open', label: 'Unpaid' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'week', label: 'This week' },
  { key: 'paid', label: 'Paid' },
] as const

const matches = (d: Debt, f: string) => {
  const s = dueState(d)
  if (f === 'paid') return s === 'paid'
  if (f === 'overdue') return s === 'overdue'
  if (f === 'week') return s !== 'paid' && daysUntil(d.dueDate) >= 0 && daysUntil(d.dueDate) <= 7
  return s !== 'paid'
}

export function Debts({ filter = 'open' }: { filter?: string }) {
  const { debts, customers } = useStore()
  const [q, setQ] = useState('')
  const nameOf = (id: string) => customers.find((c) => c.id === id)?.name ?? 'Unknown'
  const shown = debts
    .filter((d) => matches(d, filter))
    .filter((d) => !q || (nameOf(d.customerId) + ' ' + d.item).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const total = shown.reduce((s, d) => s + (filter === 'paid' ? d.amount : balanceOf(d)), 0)

  return (
    <div className="screen">
      <Header title="Debts" />
      <main>
        <div className="chips">
          {filters.map((f) => (
            <button key={f.key} className={filter === f.key ? 'on' : ''} onClick={() => go({ name: 'debts', filter: f.key }, true)}>
              {f.label}
            </button>
          ))}
        </div>
        <input className="search" placeholder="Search name or item" value={q} onChange={(e) => setQ(e.target.value)} />
        <p className="muted small">
          {shown.length} {shown.length === 1 ? 'debt' : 'debts'} · {naira(total)}
        </p>
        {shown.length === 0 ? (
          <Empty icon="✅" title="Nothing here" text={filter === 'paid' ? 'Paid debts will show here.' : 'No debts match this filter.'} />
        ) : (
          <div className="list">
            {shown.map((d) => (
              <DebtRow key={d.id} debt={d} customerName={nameOf(d.customerId)} />
            ))}
          </div>
        )}
      </main>
      <Fab label="Credit sale" onClick={() => go({ name: 'add' })} />
      <BottomNav current="debts" />
    </div>
  )
}

const methods: { key: Payment['method']; label: string }[] = [
  { key: 'paystack', label: 'Paystack' },
  { key: 'transfer', label: 'Transfer' },
  { key: 'cash', label: 'Cash' },
  { key: 'pos', label: 'POS' },
]

export function DebtDetail({ id }: { id: string }) {
  const { debts, customers, settings } = useStore()
  const debt = debts.find((d) => d.id === id)
  const customer = debt && customers.find((c) => c.id === debt.customerId)
  const [remind, setRemind] = useState(false)
  const [paying, setPaying] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<Payment['method']>('transfer')

  if (!debt || !customer) {
    return (
      <div className="screen">
        <Header title="Debt" back />
        <Empty icon="🤷" title="Not found" text="This debt was deleted." />
      </div>
    )
  }

  const bal = balanceOf(debt)
  const pct = Math.min(100, Math.round((paidOf(debt) / debt.amount) * 100))

  const savePayment = () => {
    const n = Number(amount.replace(/[^\d.]/g, ''))
    if (!n || n <= 0) return toast('Enter an amount')
    actions.addPayment(debt.id, Math.min(n, bal), method)
    setPaying(false)
    setAmount('')
    toast(n >= bal ? '🎉 Fully paid!' : 'Payment recorded')
  }

  const share = async () => {
    const blob = await receiptImage(debt, customer, settings)
    await shareImage(blob, `receipt-${customer.name.replace(/\s+/g, '-')}.png`, `Receipt from ${settings.businessName || 'Kolekt'}`)
  }

  return (
    <div className="screen">
      <Header title={customer.name} back />
      <main>
        <section className="card detail">
          <div className="row-between">
            <span className="muted">{debt.item}</span>
            <DueBadge debt={debt} />
          </div>
          <strong className="big">{naira(bal)}</strong>
          <span className="muted small">
            left of {naira(debt.amount)} · due {prettyDate(debt.dueDate)}
          </span>
          <div className="progress">
            <div style={{ width: pct + '%' }} />
          </div>
          <span className="muted tiny">{pct}% paid</span>
        </section>

        <div className="actions">
          {bal > 0 && (
            <button className="btn wa" onClick={() => setRemind(true)}>
              💬 Remind
            </button>
          )}
          {bal > 0 && (
            <button className="btn" onClick={() => setPaying(true)}>
              ✅ Record payment
            </button>
          )}
          <button className="btn ghost" onClick={share}>
            🧾 Share receipt
          </button>
          {bal > 0 && (
            <button
              className="btn ghost"
              onClick={() => {
                actions.updateDebt(debt.id, { dueDate: inDays(7) })
                toast('Moved due date 7 days ahead')
              }}
            >
              ⏳ Give 7 more days
            </button>
          )}
        </div>

        {settings.payLink && bal > 0 && (
          <p className="hint">🛡️ Before releasing goods, confirm Paystack payments in your Paystack app. Never trust a screenshot alone.</p>
        )}

        <h2 className="section">History</h2>
        <div className="card timeline">
          <div>
            <span>🛍️ Sold on credit</span>
            <span className="muted">{prettyDate(debt.createdAt)}</span>
          </div>
          {debt.payments.map((p) => (
            <div key={p.id}>
              <span>
                💵 Paid {naira(p.amount)} <span className="muted">({p.method})</span>
              </span>
              <span className="muted">{prettyDate(p.date)}</span>
            </div>
          ))}
          {debt.remindersSent > 0 && (
            <div>
              <span>💬 {debt.remindersSent} reminder{debt.remindersSent > 1 ? 's' : ''} sent</span>
              <span className="muted">{debt.lastRemindedAt ? prettyDate(debt.lastRemindedAt) : ''}</span>
            </div>
          )}
          {debt.note && (
            <div>
              <span>📝 {debt.note}</span>
            </div>
          )}
        </div>

        <button className="link-btn" onClick={() => go({ name: 'customer', id: customer.id })}>
          View all of {customer.name.split(' ')[0]}'s debts →
        </button>
        <button
          className="link-btn danger"
          onClick={() => {
            if (confirm('Delete this debt? This cannot be undone.')) {
              actions.deleteDebt(debt.id)
              history.back()
            }
          }}
        >
          Delete debt
        </button>
      </main>

      <RemindSheet debt={remind ? debt : null} onClose={() => setRemind(false)} />
      <Sheet open={paying} onClose={() => setPaying(false)} title="Record payment">
        <input className="input big-input" inputMode="numeric" placeholder="Amount (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        <div className="chips">
          <button onClick={() => setAmount(String(bal))}>Full {naira(bal)}</button>
          <button onClick={() => setAmount(String(Math.round(bal / 2)))}>Half</button>
        </div>
        <div className="seg">
          {methods.map((m) => (
            <button key={m.key} className={method === m.key ? 'on' : ''} onClick={() => setMethod(m.key)}>
              {m.label}
            </button>
          ))}
        </div>
        {method === 'transfer' && (
          <p className="warn-box">⚠️ Open your bank app and confirm the money landed before you mark it paid. Fake alerts and edited receipt screenshots are common.</p>
        )}
        {method === 'paystack' && (
          <p className="hint">🛡️ Confirm it in your Paystack app or email first. A screenshot is not proof.</p>
        )}
        <button className="btn" onClick={savePayment}>
          {method === 'transfer' || method === 'paystack' ? "I've confirmed — save payment" : 'Save payment'}
        </button>
      </Sheet>
    </div>
  )
}
