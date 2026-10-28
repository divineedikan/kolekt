import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  Languages,
  NotebookPen,
  Receipt,
  ShieldCheck,
  Smartphone,
  Star,
  WifiOff,
} from 'lucide-react'
import { useStore } from '../store'
import { go } from '../router'
import { loadDemo } from '../demo'
import { config } from '../config'
import { naira } from '../utils'
import { Footer, Logo } from '../components'

const startDemo = () => {
  loadDemo()
  go({ name: 'home' })
}

// A drawn phone so visitors see the real product, not stock photos.
function PhoneMockup() {
  return (
    <div className="mock" role="img" aria-label="Kolekt on a phone: customers owe ₦76,500, with a list of who to remind today">
      <div className="mock-phone" aria-hidden="true">
        <div className="mock-notch" />
        <div className="mock-bar">
          <span className="logo-mark sm">K</span>
          <b>Ada's Closet</b>
        </div>
        <div className="mock-hero">
          <span>Customers owe you</span>
          <strong>₦76,500</strong>
          <em>2 overdue · ₦26,500</em>
        </div>
        <div className="mock-label">Chase today</div>
        {[
          ['BO', 'Blessing Okon', '₦15,000', 'Due today', 'today'],
          ['EN', 'Emeka Nwosu', '₦14,000', '9 days late', 'late'],
          ['TB', 'Tunde Bakare', '₦12,500', '3 days late', 'late'],
        ].map(([i, n, a, d, t]) => (
          <div className="mock-row" key={n}>
            <span className="mock-av">{i}</span>
            <span className="mock-name">{n}</span>
            <span className="mock-amt">
              {a}
              <small className={`mock-due ${t}`}>{d}</small>
            </span>
          </div>
        ))}
      </div>
      <div className="mock-bubble" aria-hidden="true">
        Hello Blessing 👋, na Ada's Closet. Small reminder say ₦15,000 go due today…
        <span className="mock-link">Pay here 👉 pay link</span>
        <span className="mock-tick">✓✓</span>
      </div>
      <div className="mock-receipt" aria-hidden="true">
        <Receipt size={16} /> Receipt sent
      </div>
    </div>
  )
}

const steps = [
  { icon: NotebookPen, title: 'Log the credit sale', text: 'Name, item, price, deposit and when they promised to pay. About 10 seconds.' },
  { icon: BellRing, title: 'Tap remind', text: 'Kolekt writes a polite WhatsApp message with your pay link. You press send.' },
  { icon: CheckCircle2, title: 'Get paid, confirm, done', text: 'Record the payment after you confirm it in your bank or payment app. Share a receipt.' },
]

const features = [
  { icon: Languages, title: 'English or Pidgin', text: 'Friendly, firm or final tone, picked for you based on how late the payment is.' },
  { icon: ShieldCheck, title: 'Helps against fake alerts', text: 'Your own payment link plus a reminder to confirm before releasing goods.' },
  { icon: Receipt, title: 'Receipts customers keep', text: 'A clean receipt or balance image to post straight into WhatsApp.' },
  { icon: Star, title: 'Customer trust score', text: 'See who pays on time and who is often late, before you give credit again.' },
  { icon: WifiOff, title: 'Works offline', text: 'Install it on your phone like an app. No data? It still opens.' },
  { icon: FileSpreadsheet, title: 'Your data, your phone', text: 'No sign-up. Back up any time and export to Excel.' },
]

const faqs = [
  ['Is Kolekt a loan app?', 'No. Kolekt never lends, holds or moves money. It is a record book for sellers who already let customers pay later.'],
  ['Does it message my customers by itself?', 'Never. Kolekt opens WhatsApp with the message ready. You read it and press send.'],
  ['Which payment providers work?', 'Any link you already use: Paystack, Flutterwave, Squad, Monnify or Selar. Or just your bank account details.'],
  ['Where is my data stored?', 'On your phone only, in this browser. Nobody else can see it. Use Backup in More to save a copy.'],
  ['How much does it cost?', `Free. Pro (coming soon) will be ${naira(config.prices.monthly)}/month for cloud backup, your logo on receipts and staff access.`],
]

export function Landing() {
  const { settings } = useStore()
  const signedUp = settings.onboarded
  const primary = () => go(signedUp ? { name: 'home' } : { name: 'start' })

  return (
    <div className="landing">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="l-header">
        <nav className="l-nav" aria-label="Main">
          <Logo />
          <div className="l-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <button className="l-btn accent small" onClick={primary}>
            {signedUp ? 'Open app' : 'Start free'}
          </button>
        </nav>

        <div className="l-hero" id="main">
          <div className="l-hero-copy">
            <p className="eyebrow light">For WhatsApp &amp; Instagram sellers in Nigeria</p>
            <h1>Know who owes you. Get paid without the awkward chase.</h1>
            <p className="lede">
              Kolekt keeps track of every "I go pay you Friday", reminds customers politely on WhatsApp, and puts your payment link in every message.
            </p>
            <div className="l-actions">
              <button className="l-btn accent" onClick={primary}>
                {signedUp ? 'Open my shop' : 'Start free'} <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button className="l-btn ghost-light" onClick={startDemo}>
                <Eye size={18} aria-hidden="true" /> See a live demo
              </button>
            </div>
            <p className="notice">
              <strong>Free, no sign-up.</strong> Your records stay on your phone. Not a loan app: Kolekt never touches your money.
            </p>
          </div>
          <PhoneMockup />
        </div>
      </header>

      <main>
        <section className="l-section" id="how" aria-labelledby="how-h">
          <p className="eyebrow">How it works</p>
          <h2 id="how-h">Three taps from "abeg I go pay" to paid.</h2>
          <ol className="steps">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="step">
                <span className="step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <Icon className="step-icon" size={28} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="l-section alt" id="features" aria-labelledby="feat-h">
          <p className="eyebrow">Features</p>
          <h2 id="feat-h">Everything you need to collect what you're owed.</h2>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="feature">
                <span className="feature-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="l-section" id="pricing" aria-labelledby="price-h">
          <p className="eyebrow">Pricing</p>
          <h2 id="price-h">Free to use. Pro will cost less than half of similar apps.</h2>
          <div className="price-grid">
            <article className="price-card">
              <h3>Free</h3>
              <p className="price">
                ₦0 <small>forever</small>
              </p>
              <ul>
                <li>Unlimited customers and credit sales</li>
                <li>WhatsApp reminders, English and Pidgin</li>
                <li>Payment link in every reminder</li>
                <li>Receipts, statements and trust scores</li>
                <li>Backup and Excel export</li>
              </ul>
              <button className="l-btn dark" onClick={primary}>
                Start free
              </button>
            </article>
            <article className="price-card featured">
              <span className="ribbon">Coming soon</span>
              <h3>Pro</h3>
              <p className="price">
                {naira(config.prices.monthly)} <small>/month</small>
              </p>
              <p className="small">
                or {naira(config.prices.quarterly)}/quarter · {naira(config.prices.yearly)}/year. Prepaid, no auto-renew.
              </p>
              <ul>
                <li>Cloud backup and use on 2 phones</li>
                <li>Your logo on receipts</li>
                <li>Remove "sent with Kolekt"</li>
                <li>Monthly report and staff access</li>
              </ul>
              <a className="l-btn accent" href={`https://wa.me/${config.founderWhatsApp}?text=${encodeURIComponent('Hi! I want early access to Kolekt Pro 🙌')}`} target="_blank" rel="noreferrer">
                Join early access on WhatsApp
              </a>
            </article>
          </div>
          <p className="footnote">
            Comparable Nigerian debt-tracking apps listed ₦2,500–₦3,000/month on their websites in October 2026. Pro features are not available yet.
          </p>
        </section>

        <section className="l-section alt" id="faq" aria-labelledby="faq-h">
          <p className="eyebrow">Questions</p>
          <h2 id="faq-h">Good to know</h2>
          <div className="faq">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="l-cta" aria-labelledby="cta-h">
          <Smartphone size={34} aria-hidden="true" />
          <h2 id="cta-h">Stop keeping debts in your head.</h2>
          <p>Open Kolekt on your phone, add it to your home screen, and record your first credit sale.</p>
          <div className="l-actions center">
            <button className="l-btn accent" onClick={primary}>
              Start free <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button className="l-btn ghost-light" onClick={startDemo}>
              See a live demo
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
