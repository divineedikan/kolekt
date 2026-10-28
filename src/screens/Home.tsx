import { useState } from 'react'
import { useStore, type Debt } from '../store'
import { balanceOf, dueState, naira, daysUntil } from '../utils'
import { BottomNav, DebtRow, Empty, Fab, Header } from '../components'
import { go } from '../router'
import { RemindSheet } from './Remind'

export function Home() {
  const { debts, customers, settings } = useStore()
  const [remind, setRemind] = useState<Debt | null>(null)
  const nameOf = (id: string) => customers.find((c) => c.id === id)?.name ?? 'Unknown'

  const open = debts.filter((d) => balanceOf(d) > 0)
  const owed = open.reduce((s, d) => s + balanceOf(d), 0)
  const overdue = open.filter((d) => dueState(d) === 'overdue')
  const dueWeek = open.filter((d) => {
    const n = daysUntil(d.dueDate)
    return n >= 0 && n <= 7
  })
  const month = new Date().toISOString().slice(0, 7)
  const collected = debts.flatMap((d) => d.payments).filter((p) => p.date.startsWith(month)).reduce((s, p) => s + p.amount, 0)

  const chase = open
    .filter((d) => ['overdue', 'today'].includes(dueState(d)))
    .sort((a, b) => balanceOf(b) - balanceOf(a))
    .slice(0, 6)

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="screen">
      <Header title={settings.businessName || 'Kolekt'} />
      <main>
        <p className="greet">{greet} 👋</p>
        <section className="hero">
          <span>Customers owe you</span>
          <strong>{naira(owed)}</strong>
          <div className="hero-row">
            <button onClick={() => go({ name: 'debts', filter: 'overdue' })}>
              <b>{overdue.length}</b> overdue · {naira(overdue.reduce((s, d) => s + balanceOf(d), 0))}
            </button>
          </div>
        </section>

        <div className="stats">
          <div className="stat">
            <span>Collected this month</span>
            <b className="pos">{naira(collected)}</b>
          </div>
          <div className="stat" onClick={() => go({ name: 'debts', filter: 'week' })}>
            <span>Due in 7 days</span>
            <b>{naira(dueWeek.reduce((s, d) => s + balanceOf(d), 0))}</b>
          </div>
        </div>

        {!settings.payLink && (
          <button className="tip" onClick={() => go({ name: 'settings' })}>
            <b>🛡️ Stop fake transfer alerts</b>
            <span>Add your own Paystack link. Customers pay you directly and Paystack confirms it. Tap to set up.</span>
          </button>
        )}

        <h2 className="section">Chase today</h2>
        {debts.length === 0 ? (
          <Empty icon="📒" title="No credit sales yet" text="Record a sale you gave on credit. Kolekt will tell you when to remind them.">
            <button className="btn" onClick={() => go({ name: 'add' })}>
              Record first credit sale
            </button>
          </Empty>
        ) : chase.length === 0 ? (
          <div className="card center">🎉 Nobody to chase today. Enjoy your day!</div>
        ) : (
          <div className="list">
            {chase.map((d) => (
              <div key={d.id} className="chase">
                <DebtRow debt={d} customerName={nameOf(d.customerId)} />
                <button className="remind-mini" aria-label={`Remind ${nameOf(d.customerId)}`} onClick={() => setRemind(d)}>
                  💬
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      {debts.length > 0 && <Fab label="Credit sale" onClick={() => go({ name: 'add' })} />}
      <RemindSheet debt={remind} onClose={() => setRemind(null)} />
      <BottomNav current="home" />
    </div>
  )
}
