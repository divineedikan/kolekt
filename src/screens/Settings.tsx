import { useEffect, useRef, useState } from 'react'
import { actions, useStore, type Settings as S, type State } from '../store'
import { balanceOf, naira } from '../utils'
import { BottomNav, Header, toast } from '../components'
import { go } from '../router'
import { config } from '../config'

interface InstallPrompt extends Event {
  prompt(): Promise<void>
}

let deferredInstall: InstallPrompt | null = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredInstall = e as InstallPrompt
})

function download(name: string, text: string, type: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

function Field({ label, k, placeholder, type = 'text', hint }: { label: string; k: keyof S; placeholder: string; type?: string; hint?: string }) {
  const { settings } = useStore()
  return (
    <>
      <label>{label}</label>
      <input
        className="input"
        type={type}
        placeholder={placeholder}
        defaultValue={String(settings[k] ?? '')}
        onBlur={(e) => actions.updateSettings({ [k]: e.target.value.trim() } as Partial<S>)}
      />
      {hint && <p className="muted tiny">{hint}</p>}
    </>
  )
}

export function Settings() {
  const state = useStore()
  const { settings } = state
  const file = useRef<HTMLInputElement>(null)
  const [canInstall, setCanInstall] = useState(!!deferredInstall)

  useEffect(() => {
    const on = () => setCanInstall(true)
    window.addEventListener('beforeinstallprompt', on)
    return () => window.removeEventListener('beforeinstallprompt', on)
  }, [])

  const backup = () => {
    download(`kolekt-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(actions.snapshot(), null, 2), 'application/json')
    toast('Backup saved. Keep it safe (e.g. send it to yourself on WhatsApp).')
  }

  const restore = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as State
      if (!Array.isArray(data.debts) || !Array.isArray(data.customers)) throw new Error('bad file')
      if (confirm('Replace everything on this phone with the backup?')) {
        actions.replaceAll(data)
        toast('Backup restored ✔')
      }
    } catch {
      toast('That is not a Kolekt backup file')
    }
  }

  const csv = () => {
    const nameOf = (id: string) => state.customers.find((c) => c.id === id)
    const rows = [['Customer', 'Phone', 'Item', 'Amount', 'Paid', 'Balance', 'Due date', 'Created']]
    for (const d of state.debts) {
      const c = nameOf(d.customerId)
      rows.push([c?.name ?? '', c?.phone ?? '', d.item, String(d.amount), String(d.amount - balanceOf(d)), String(balanceOf(d)), d.dueDate, d.createdAt.slice(0, 10)])
    }
    download('kolekt-debts.csv', rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv')
  }

  return (
    <div className="screen">
      <Header title="More" />
      <main className="form">
        <button className="plan-banner" onClick={() => go({ name: 'plans' })}>
          <b>🎁 Kolekt is free</b>
          <span>Pro will be just {naira(config.prices.monthly)}/month, less than half what others charge. See plans →</span>
        </button>

        {canInstall && (
          <button
            className="btn"
            onClick={async () => {
              await deferredInstall?.prompt()
              deferredInstall = null
              setCanInstall(false)
            }}
          >
            📲 Install Kolekt on your phone
          </button>
        )}

        <h2 className="section">Business</h2>
        <Field label="Business name" k="businessName" placeholder="e.g. Ada's Closet" />
        <Field label="Your WhatsApp number" k="sellerPhone" type="tel" placeholder="0803 123 4567" />

        <h2 className="section">Payment</h2>
        <Field
          label="Your Paystack payment link"
          k="payLink"
          type="url"
          placeholder="https://paystack.shop/pay/your-shop"
          hint="Create a free Payment Page in your Paystack dashboard and paste the link. Money goes straight to you; Kolekt never touches it."
        />
        <Field label="Or bank details (fallback)" k="bankDetails" placeholder="0123456789 · GTBank · Ada Obi" />

        <h2 className="section">Reminders</h2>
        <label>Default language</label>
        <div className="seg">
          <button className={settings.lang === 'en' ? 'on' : ''} onClick={() => actions.updateSettings({ lang: 'en' })}>
            English
          </button>
          <button className={settings.lang === 'pcm' ? 'on' : ''} onClick={() => actions.updateSettings({ lang: 'pcm' })}>
            Pidgin
          </button>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={settings.footer} onChange={(e) => actions.updateSettings({ footer: e.target.checked })} />
          Add "sent with Kolekt" to messages (helps Kolekt stay free)
        </label>

        <h2 className="section">Your data</h2>
        <p className="muted tiny">Your records are stored only on this phone. Back up regularly.</p>
        <div className="actions">
          <button className="btn ghost" onClick={backup}>
            💾 Back up
          </button>
          <button className="btn ghost" onClick={() => file.current?.click()}>
            ♻️ Restore
          </button>
          <button className="btn ghost" onClick={csv}>
            📊 Export to Excel (CSV)
          </button>
        </div>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />

        <p className="muted tiny center">Kolekt v0.1 · Not a loan app. Kolekt never lends, holds or moves money.</p>
      </main>
      <BottomNav current="settings" />
    </div>
  )
}

const free = ['Unlimited customers and debts', 'WhatsApp reminders in English and Pidgin', 'Paystack pay links (no fake alerts)', 'Receipt images to share', 'Customer trust score', 'Works offline, installs like an app', 'Backup and Excel export']
const pro = ['Cloud backup and use on 2 phones', 'Your logo on receipts', 'Remove "sent with Kolekt"', 'Monthly sales and debt report', 'Staff access']

export function Plans() {
  const p = config.prices
  const join = config.founderWhatsApp
    ? `https://wa.me/${config.founderWhatsApp}?text=${encodeURIComponent("Hi! I want early access to Kolekt Pro 🙌")}`
    : ''
  return (
    <div className="screen">
      <Header title="Plans" back />
      <main>
        <section className="card plan">
          <h3>Free</h3>
          <strong className="big">₦0</strong>
          <span className="muted small">forever</span>
          <ul>
            {free.map((f) => (
              <li key={f}>✅ {f}</li>
            ))}
          </ul>
        </section>
        <section className="card plan pro">
          <span className="ribbon">Coming soon</span>
          <h3>Pro</h3>
          <strong className="big">{naira(p.monthly)}<small>/month</small></strong>
          <span className="small">
            or {naira(p.quarterly)}/quarter (save 20%) · {naira(p.yearly)}/year (save 25%)
          </span>
          <ul>
            {pro.map((f) => (
              <li key={f}>⭐ {f}</li>
            ))}
          </ul>
          <p className="small">Similar apps charge ₦2,500–₦3,000 a month. Pro will cost less than half, with prepaid plans and no auto-renew surprises.</p>
          {config.proPayLink ? (
            <a className="btn" href={config.proPayLink} target="_blank" rel="noreferrer">
              Get Pro
            </a>
          ) : join ? (
            <a className="btn" href={join} target="_blank" rel="noreferrer">
              Join early access (first 100 get 3 months free)
            </a>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export function Onboarding() {
  const [step, setStep] = useState(0)
  const [biz, setBiz] = useState('')
  const [link, setLink] = useState('')
  return (
    <div className="onboard">
      {step === 0 ? (
        <div className="ob-card">
          <div className="ob-logo">₦</div>
          <h1>Know who owes you. Get paid faster.</h1>
          <ul>
            <li>📒 Record credit sales in 10 seconds</li>
            <li>💬 Polite WhatsApp reminders, English or Pidgin</li>
            <li>🛡️ Pay links that kill fake transfer alerts</li>
            <li>🧾 Share receipts your customers will love</li>
          </ul>
          <button className="btn" onClick={() => setStep(1)}>
            Start free
          </button>
          <p className="muted tiny">No sign-up. Your data stays on your phone.</p>
        </div>
      ) : (
        <div className="ob-card">
          <h2>Set up your shop</h2>
          <label>Business name</label>
          <input className="input" placeholder="e.g. Ada's Closet" value={biz} onChange={(e) => setBiz(e.target.value)} autoFocus />
          <label>Paystack payment link (optional)</label>
          <input className="input" type="url" placeholder="https://paystack.shop/pay/..." value={link} onChange={(e) => setLink(e.target.value)} />
          <p className="muted tiny">You can add this later in More → Payment.</p>
          <button
            className="btn"
            onClick={() => {
              if (!biz.trim()) return toast('Enter your business name')
              actions.updateSettings({ businessName: biz.trim(), payLink: link.trim(), onboarded: true })
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
