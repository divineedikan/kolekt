import { useState, type FormEvent } from 'react'
import { CloudUpload, Image as ImageIcon, LogOut } from 'lucide-react'
import { actions, useStore } from '../store'
import { cloudEnabled, fetchBackup, isProActive, pushBackup, restoreBackup, sendCode, signOut, useCloud, verifyCode } from '../cloud'
import { prettyDate } from '../utils'
import { toast } from '../components'
import { go } from '../router'

const when = (iso: string | null) => (iso ? `${prettyDate(iso)}, ${new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}` : 'never')

// Shown in More. Hidden entirely until Supabase keys are configured.
export function CloudSection() {
  const c = useCloud()
  const { debts } = useStore()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  if (!cloudEnabled) return null
  const pro = isProActive(c)

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address')
    setBusy(true)
    const msg = await sendCode(email.trim())
    setBusy(false)
    if (msg) return setErr(msg)
    setErr('')
    setStep('code')
  }

  const submitCode = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const msg = await verifyCode(email.trim(), code.trim())
    setBusy(false)
    if (msg) return setErr(msg)
    setErr('')
    // Offer the cloud copy straight away on a new phone.
    const b = await fetchBackup()
    if (b && (debts.length === 0 || confirm(`A cloud backup from ${when(b.updatedAt)} was found. Replace the records on this phone with it?`))) {
      restoreBackup(b)
      toast('Records restored from the cloud')
    }
  }

  if (!c.session) {
    return (
      <>
        <h2 className="section">Cloud backup (Pro)</h2>
        <p className="muted tiny">Sign in to keep your records safe if you lose your phone, and to use Kolekt on 2 phones. No password: we email you a 6-digit code.</p>
        {step === 'email' ? (
          <form onSubmit={submitEmail} noValidate>
            <label htmlFor="cl-email">Email</label>
            <input id="cl-email" className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Email me a code'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitCode} noValidate>
            <label htmlFor="cl-code">6-digit code sent to {email}</label>
            <input id="cl-code" className="input big-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
            <button className="btn" type="submit" disabled={busy || code.length < 6}>
              {busy ? 'Checking…' : 'Sign in'}
            </button>
            <button type="button" className="link-btn" onClick={() => setStep('email')}>
              Use a different email
            </button>
          </form>
        )}
        {err && (
          <p className="form-error" role="alert">
            {err}
          </p>
        )}
      </>
    )
  }

  return (
    <>
      <h2 className="section">Cloud backup (Pro)</h2>
      <div className="card cloud-card">
        <p className="small">
          Signed in as <b>{c.session.user.email}</b>
        </p>
        {pro ? (
          <p className="small">
            Pro active until <b>{prettyDate(c.proUntil!)}</b>. Last backup: {c.syncing ? 'backing up…' : when(c.lastSync)}
          </p>
        ) : (
          <p className="small">
            Pro is not active on this account.{' '}
            <button className="link-btn inline" onClick={() => go({ name: 'plans' })}>
              See plans
            </button>
          </p>
        )}
        {c.error && (
          <p className="form-error" role="alert">
            {c.error}
          </p>
        )}
        <div className="actions">
          <button className="btn ghost" disabled={!pro || c.syncing} onClick={async () => toast((await pushBackup()) || 'Backed up to the cloud')}>
            <CloudUpload size={18} aria-hidden="true" /> Back up now
          </button>
          <button
            className="btn ghost"
            onClick={async () => {
              const b = await fetchBackup()
              if (!b) return toast('No cloud backup yet')
              if (confirm(`Replace the records on this phone with the cloud backup from ${when(b.updatedAt)}?`)) {
                restoreBackup(b)
                toast('Records restored from the cloud')
              }
            }}
          >
            Restore from cloud
          </button>
          <button className="btn ghost" onClick={() => void signOut()}>
            <LogOut size={18} aria-hidden="true" /> Sign out
          </button>
        </div>
      </div>
      {pro && <LogoPicker />}
    </>
  )
}

// Shrinks the picked image to 160px so it fits in local storage and on receipts.
function LogoPicker() {
  const { settings } = useStore()
  const pick = (file: File) => {
    const img = new Image()
    img.onload = () => {
      const size = 160
      const c = document.createElement('canvas')
      const scale = Math.min(size / img.width, size / img.height, 1)
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      actions.updateSettings({ logo: c.toDataURL('image/png') })
      URL.revokeObjectURL(img.src)
      toast('Logo added to your receipts')
    }
    img.src = URL.createObjectURL(file)
  }
  return (
    <>
      <label htmlFor="logo-file">Logo on receipts</label>
      <div className="logo-row">
        {settings.logo ? <img src={settings.logo} alt="Your logo" className="logo-preview" /> : <ImageIcon size={28} aria-hidden="true" />}
        <input id="logo-file" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
        {settings.logo && (
          <button className="link-btn" onClick={() => actions.updateSettings({ logo: undefined })}>
            Remove
          </button>
        )}
      </div>
    </>
  )
}
