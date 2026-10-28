import { useState } from 'react'
import { actions, useStore } from '../store'
import { balanceOf, naira, trustOf, waLink } from '../utils'
import { statementText } from '../templates'
import { BottomNav, DebtRow, Empty, Header, TrustBadge, initials, toast } from '../components'
import { go } from '../router'

export function Customers() {
  const { customers, debts } = useStore()
  const [q, setQ] = useState('')
  const owedBy = (id: string) => debts.filter((d) => d.customerId === id).reduce((s, d) => s + balanceOf(d), 0)
  const shown = customers
    .filter((c) => !q || (c.name + c.phone).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => owedBy(b.id) - owedBy(a.id))

  return (
    <div className="screen">
      <Header title="Customers" />
      <main>
        <input className="search" placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
        {shown.length === 0 ? (
          <Empty icon="👥" title="No customers yet" text="Customers are added when you record a credit sale." />
        ) : (
          <div className="list">
            {shown.map((c) => (
              <button key={c.id} className="row" onClick={() => go({ name: 'customer', id: c.id })}>
                <div className="avatar">{initials(c.name)}</div>
                <div className="row-main">
                  <strong>{c.name}</strong>
                  <TrustBadge trust={trustOf(c, debts)} />
                </div>
                <div className="row-end">
                  <strong>{naira(owedBy(c.id))}</strong>
                  <span className="muted tiny">owes</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      <BottomNav current="customers" />
    </div>
  )
}

export function CustomerDetail({ id }: { id: string }) {
  const { customers, debts, settings } = useStore()
  const customer = customers.find((c) => c.id === id)
  const [editing, setEditing] = useState(false)
  if (!customer) {
    return (
      <div className="screen">
        <Header title="Customer" back />
        <Empty icon="🤷" title="Not found" text="This customer was deleted." />
      </div>
    )
  }
  const mine = debts.filter((d) => d.customerId === id)
  const owed = mine.reduce((s, d) => s + balanceOf(d), 0)
  const bought = mine.reduce((s, d) => s + d.amount, 0)
  const trust = trustOf(customer, debts)

  return (
    <div className="screen">
      <Header title={customer.name} back />
      <main>
        <section className="card detail">
          <div className="row-between">
            <span className="muted">{customer.phone}</span>
            <TrustBadge trust={trust} />
          </div>
          <strong className="big">{naira(owed)}</strong>
          <span className="muted small">
            owed now · {naira(bought)} bought in total across {mine.length} sale{mine.length === 1 ? '' : 's'}
          </span>
        </section>

        <div className="actions">
          <button className="btn" onClick={() => go({ name: 'add', customerId: customer.id })}>
            + New sale
          </button>
          <button className="btn wa" onClick={() => window.open(waLink(customer.phone, statementText(customer, mine, settings)), '_blank')}>
            📄 Send statement
          </button>
          <a className="btn ghost" href={`tel:${customer.phone}`}>
            📞 Call
          </a>
          <button className="btn ghost" onClick={() => setEditing((v) => !v)}>
            ✏️ Edit
          </button>
        </div>

        {editing && (
          <div className="card form">
            <label>Name</label>
            <input className="input" defaultValue={customer.name} onBlur={(e) => e.target.value.trim() && actions.updateCustomer(id, { name: e.target.value.trim() })} />
            <label>WhatsApp number</label>
            <input className="input" type="tel" defaultValue={customer.phone} onBlur={(e) => actions.updateCustomer(id, { phone: e.target.value.trim() })} />
            <button className="btn small" onClick={() => (setEditing(false), toast('Saved'))}>
              Done
            </button>
          </div>
        )}

        <h2 className="section">Sales</h2>
        <div className="list">
          {mine.map((d) => (
            <DebtRow key={d.id} debt={d} customerName={d.item} />
          ))}
        </div>

        <button
          className="link-btn danger"
          onClick={() => {
            if (confirm(`Delete ${customer.name} and all their records?`)) {
              actions.deleteCustomer(id)
              history.back()
            }
          }}
        >
          Delete customer
        </button>
      </main>
    </div>
  )
}
