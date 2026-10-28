import { useState } from 'react'
import { actions, useStore } from '../store'
import { inDays, monthEnd, naira, nextFriday, prettyDate } from '../utils'
import { Header, toast } from '../components'
import { go } from '../router'

interface ContactsManager {
  select(props: string[], opts?: { multiple?: boolean }): Promise<{ name?: string[]; tel?: string[] }[]>
}

const dueOptions = () => [
  { label: 'Friday', value: nextFriday() },
  { label: '1 week', value: inDays(7) },
  { label: '2 weeks', value: inDays(14) },
  { label: 'Month end', value: monthEnd() },
]

export function AddDebt({ customerId }: { customerId?: string }) {
  const { customers } = useStore()
  const [pickedId, setPickedId] = useState(customerId ?? '')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')
  const [paidNow, setPaidNow] = useState('')
  const [due, setDue] = useState(nextFriday())
  const [note, setNote] = useState('')

  const picked = customers.find((c) => c.id === pickedId)
  const matches = name.length > 0 && !picked ? customers.filter((c) => c.name.toLowerCase().includes(name.toLowerCase())).slice(0, 4) : []
  const contacts = (navigator as Navigator & { contacts?: ContactsManager }).contacts

  const fromContacts = async () => {
    try {
      const [c] = await contacts!.select(['name', 'tel'])
      if (c) {
        setName(c.name?.[0] ?? '')
        setPhone(c.tel?.[0] ?? '')
      }
    } catch {
      // Picker closed.
    }
  }

  const num = (s: string) => Number(s.replace(/[^\d.]/g, '')) || 0
  const total = num(amount)
  const paid = Math.min(num(paidNow), total)

  const save = () => {
    if (!picked && !name.trim()) return toast("Enter the customer's name")
    if (!picked && phone.replace(/\D/g, '').length < 10) return toast('Enter a valid WhatsApp number')
    if (!item.trim()) return toast('What did they buy?')
    if (total <= 0) return toast('Enter the amount')
    if (paid >= total) return toast('Fully paid? Then it is not a credit sale 🙂')
    const customer = picked ?? actions.addCustomer({ name: name.trim(), phone: phone.trim() })
    const debt = actions.addDebt({ customerId: customer.id, item: item.trim(), amount: total, dueDate: due, note: note.trim() || undefined }, paid, 'cash')
    toast('Saved ✔')
    go({ name: 'debt', id: debt.id }, true)
  }

  return (
    <div className="screen">
      <Header title="New credit sale" back />
      <main className="form">
        <label>Customer</label>
        {picked ? (
          <div className="picked">
            <span>
              <b>{picked.name}</b> <span className="muted">{picked.phone}</span>
            </span>
            <button className="link-btn" onClick={() => setPickedId('')}>
              Change
            </button>
          </div>
        ) : (
          <>
            <input className="input" placeholder="Name e.g. Chioma" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            {matches.map((c) => (
              <button key={c.id} className="suggest" onClick={() => setPickedId(c.id)}>
                👤 {c.name} <span className="muted">{c.phone}</span>
              </button>
            ))}
            <input className="input" type="tel" inputMode="tel" placeholder="WhatsApp number e.g. 0803 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {contacts && (
              <button className="link-btn" onClick={fromContacts}>
                📇 Pick from phone contacts
              </button>
            )}
          </>
        )}

        <label>What did they buy?</label>
        <input className="input" placeholder="e.g. 2 Ankara gowns" value={item} onChange={(e) => setItem(e.target.value)} />

        <div className="two">
          <div>
            <label>Total price (₦)</label>
            <input className="input" inputMode="numeric" placeholder="15000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label>Paid now (₦)</label>
            <input className="input" inputMode="numeric" placeholder="0" value={paidNow} onChange={(e) => setPaidNow(e.target.value)} />
          </div>
        </div>
        {total > 0 && <p className="muted small">They will owe you <b>{naira(total - paid)}</b></p>}

        <label>When will they pay?</label>
        <div className="chips">
          {dueOptions().map((o) => (
            <button key={o.label} className={due === o.value ? 'on' : ''} onClick={() => setDue(o.value)}>
              {o.label}
            </button>
          ))}
        </div>
        <input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <p className="muted small">Due {prettyDate(due)}</p>

        <label>Note (optional)</label>
        <input className="input" placeholder="e.g. Will pay after salary" value={note} onChange={(e) => setNote(e.target.value)} />

        <button className="btn sticky" onClick={save}>
          Save credit sale
        </button>
      </main>
    </div>
  )
}
