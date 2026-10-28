import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, Download, FileSpreadsheet, Globe, RotateCcw, Smartphone, Star } from 'lucide-react'
import { actions, useStore, type Settings as S, type State } from '../store'
import { balanceOf, naira } from '../utils'
import { BottomNav, Header, Logo, toast } from '../components'
import { go } from '../router'
import { config } from '../config'
import { CloudSection } from './Cloud'
import { cloudEnabled, isProActive, useCloud } from '../cloud'

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
  const id = useId()
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input"
        type={type}
        placeholder={placeholder}
        aria-describedby={hint ? id + '-hint' : undefined}
        defaultValue={String(settings[k] ?? '')}
        onBlur={(e) => actions.updateSettings({ [k]: e.target.value.trim() } as Partial<S>)}
      />
      {hint && (
        <p className="muted tiny" id={id + '-hint'}>
          {hint}
        </p>
      )}
    </>
  )
}

export function Settings() {
  const state = useStore()
  const cloud = useCloud()
  // Footer removal is a Pro perk once Pro exists; before cloud is set up, everyone can toggle it.
  const canHideFooter = !cloudEnabled || isProActive(cloud)
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
    toast('Backup saved. Keep it safe, e.g. send it to yourself on WhatsApp.')
  }

  const restore = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as State
      if (!Array.isArray(data.debts) || !Array.isArray(data.customers)) throw new Error('bad file')
      if (confirm('Replace everything on this phone with the backup?')) {
        actions.replaceAll(data)
        toast('Backup restored')
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
          <Star size={20} aria-hidden="true" />
          <span>
            <b>Kolekt is free.</b> Pro will be just {naira(config.prices.monthly)}/month. See plans
          </span>
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
            <Smartphone size={18} aria-hidden="true" /> Install Kolekt on your phone
          </button>
        )}

        <h2 className="section">Business</h2>
        <Field label="Business name" k="businessName" placeholder="e.g. Ada's Closet" />

        <h2 className="section">Payment</h2>
        <Field
          label="Your payment link"
          k="payLink"
          type="url"
          placeholder="https://..."
          hint="Any provider works: Paystack Payment Page, Flutterwave Payment Link, Squad, Monnify or Selar. Money goes straight to you; Kolekt never touches it."
        />
        <Field label="Or bank details (fallback)" k="bankDetails" placeholder="0123456789 · Bank name · Account name" />

        <CloudSection />

        <h2 className="section">Reminders</h2>
        <fieldset className="seg" aria-label="Default reminder language">
          <button className={settings.lang === 'en' ? 'on' : ''} aria-pressed={settings.lang === 'en'} onClick={() => actions.updateSettings({ lang: 'en' })}>
            English
          </button>
          <button className={settings.lang === 'pcm' ? 'on' : ''} aria-pressed={settings.lang === 'pcm'} onClick={() => actions.updateSettings({ lang: 'pcm' })}>
            Pidgin
          </button>
        </fieldset>
        <label className="toggle">
          <input type="checkbox" checked={settings.footer || !canHideFooter} disabled={!canHideFooter} onChange={(e) => actions.updateSettings({ footer: e.target.checked })} />
          Add "sent with Kolekt" to messages{canHideFooter ? ' (helps Kolekt stay free)' : ' (Pro can turn this off)'}
        </label>

        <h2 className="section">Your data</h2>
        <p className="muted tiny">{cloudEnabled && isProActive(cloud) ? 'Your records are on this phone and backed up to the cloud.' : 'Your records are stored only on this phone. Back up regularly.'}</p>
        <div className="actions">
          <button className="btn ghost" onClick={backup}>
            <Download size={18} aria-hidden="true" /> Back up
          </button>
          <button className="btn ghost" onClick={() => file.current?.click()}>
            <RotateCcw size={18} aria-hidden="true" /> Restore
          </button>
          <button className="btn ghost" onClick={csv}>
            <FileSpreadsheet size={18} aria-hidden="true" /> Export to Excel
          </button>
          <a className="btn ghost" href="#/welcome">
            <Globe size={18} aria-hidden="true" /> Kolekt website
          </a>
        </div>
        <input ref={file} type="file" accept="application/json" hidden aria-hidden="true" onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />

        <p className="muted tiny center legal-links">
          <a href="#/privacy">Privacy</a> · <a href="#/terms">Terms</a> · <a href="#/refunds">Refunds</a> · <a href="#/cookies">Cookies</a>
        </p>
        <p className="muted tiny center">Kolekt v0.3 · Not a loan app. Kolekt never lends, holds or moves money.</p>
      </main>
      <BottomNav current="settings" />
    </div>
  )
}

const free = ['Unlimited customers and debts', 'WhatsApp reminders in English and Pidgin', 'Your payment link in every reminder', 'Receipt images to share', 'Customer trust score', 'Works offline, installs like an app', 'Backup and Excel export']
const pro = ['Cloud backup and use on 2 phones', 'Your logo on receipts', 'Remove "sent with Kolekt"', 'Monthly report (coming later)', 'Staff access (coming later)']

export function Plans() {
  const p = config.prices
  const cloud = useCloud()
  const active = isProActive(cloud)
  const join = config.founderWhatsApp ? `https://wa.me/${config.founderWhatsApp}?text=${encodeURIComponent('Hi! I want early access to Kolekt Pro 🙌')}` : ''
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
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
        <section className="card plan pro">
          <span className="ribbon">Coming soon</span>
          <h3>Pro</h3>
          <strong className="big">
            {naira(p.monthly)}
            <small>/month</small>
          </strong>
          <span className="small">
            or {naira(p.quarterly)}/quarter (save 20%) · {naira(p.yearly)}/year (save 25%)
          </span>
          <ul>
            {pro.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="small">Comparable apps listed ₦2,500–₦3,000 a month in October 2026. Prepaid plans, no auto-renew. See the <a href="#/refunds">refund policy</a>.</p>
          {active ? (
            <p className="small">
              <b>Your Pro is active until {cloud.proUntil}.</b> Thank you!
            </p>
          ) : config.proPayLink ? (
            <a className="btn" href={config.proPayLink} target="_blank" rel="noreferrer">
              Get Pro
            </a>
          ) : join ? (
            <a className="btn" href={join} target="_blank" rel="noreferrer">
              Join early access on WhatsApp
            </a>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export function Onboarding() {
  const [biz, setBiz] = useState('')
  const [link, setLink] = useState('')
  const [agree, setAgree] = useState(false)
  const [err, setErr] = useState('')

  const done = (e: FormEvent) => {
    e.preventDefault()
    if (!biz.trim()) return setErr('Enter your business name')
    if (!agree) return setErr('Please agree to the Terms and Privacy policy to continue')
    actions.updateSettings({ businessName: biz.trim(), payLink: link.trim(), onboarded: true, demo: false })
    go({ name: 'home' }, true)
  }

  return (
    <div className="onboard">
      <form className="ob-card" onSubmit={done} noValidate>
        <button type="button" className="link-btn back" onClick={() => go({ name: 'welcome' })}>
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </button>
        <Logo onDark={false} />
        <h1>Set up your shop</h1>
        <p className="muted small">Takes 20 seconds. No account, no password.</p>
        <label htmlFor="ob-biz">Business name</label>
        <input id="ob-biz" className="input" autoComplete="organization" placeholder="e.g. Ada's Closet" value={biz} onChange={(e) => setBiz(e.target.value)} required />
        <label htmlFor="ob-link">Payment link (optional)</label>
        <input id="ob-link" className="input" type="url" inputMode="url" placeholder="Paystack, Flutterwave, Squad… link" value={link} onChange={(e) => setLink(e.target.value)} aria-describedby="ob-link-hint" />
        <p className="muted tiny" id="ob-link-hint">
          You can add or change this later in More → Payment.
        </p>
        <label className="toggle">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
          <span>
            I agree to the <a href="#/terms">Terms</a> and <a href="#/privacy">Privacy policy</a>, and I'll only add customers who agreed to hear from me.
          </span>
        </label>
        {err && (
          <p className="form-error" role="alert">
            {err}
          </p>
        )}
        <button className="btn" type="submit">
          Open my shop
        </button>
      </form>
    </div>
  )
}
