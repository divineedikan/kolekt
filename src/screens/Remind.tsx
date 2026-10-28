import { useState } from 'react'
import { actions, useStore, type Debt, type Lang, type Tone } from '../store'
import { reminderText, toneNames } from '../templates'
import { dueState, waLink } from '../utils'
import { Sheet, toast } from '../components'

// Picks a tone that matches how late the debt is, so the seller rarely has to think.
const suggestedTone = (d: Debt): Tone =>
  dueState(d) !== 'overdue' ? 'friendly' : d.remindersSent >= 2 ? 'final' : 'firm'

export function RemindSheet({ debt, onClose }: { debt: Debt | null; onClose: () => void }) {
  const { customers, settings } = useStore()
  const [tone, setTone] = useState<Tone | null>(null)
  const [lang, setLang] = useState<Lang | null>(null)
  const customer = debt ? customers.find((c) => c.id === debt.customerId) : undefined
  if (!debt || !customer) return null

  const t = tone ?? suggestedTone(debt)
  const l = lang ?? settings.lang
  const text = reminderText(debt, customer, settings, t, l)

  const send = () => {
    window.open(waLink(customer.phone, text), '_blank')
    actions.markReminded(debt.id)
    toast('WhatsApp opened — tap send there')
    setTone(null)
    setLang(null)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={`Remind ${customer.name.split(' ')[0]}`}>
      <div className="seg" role="group" aria-label="Message tone">
        {(Object.keys(toneNames) as Tone[]).map((k) => (
          <button key={k} className={t === k ? 'on' : ''} aria-pressed={t === k} onClick={() => setTone(k)}>
            {toneNames[k]}
          </button>
        ))}
      </div>
      <div className="seg small" role="group" aria-label="Message language">
        <button className={l === 'en' ? 'on' : ''} aria-pressed={l === 'en'} onClick={() => setLang('en')}>
          English
        </button>
        <button className={l === 'pcm' ? 'on' : ''} aria-pressed={l === 'pcm'} onClick={() => setLang('pcm')}>
          Pidgin
        </button>
      </div>
      <div className="bubble" aria-label="Message preview">{text}</div>
      {!settings.payLink && !settings.bankDetails && (
        <p className="hint">Tip: add your payment link in More → Payment so customers can pay in one tap.</p>
      )}
      <button className="btn wa" onClick={send}>
        Send on WhatsApp
      </button>
      <p className="muted center tiny">You always press send yourself. Kolekt never messages anyone on its own.</p>
    </Sheet>
  )
}
