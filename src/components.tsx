import { useEffect, useRef, type ReactNode } from 'react'
import { ArrowLeft, BookOpen, Home as HomeIcon, Plus, Settings as Cog, Users } from 'lucide-react'
import type { Debt } from './store'
import { balanceOf, dueLabel, dueState, naira, type Trust } from './utils'
import { go, type Route } from './router'
import { business, waContact } from './business'

export function Logo({ onDark = true }: { onDark?: boolean }) {
  return (
    <a className={`brand ${onDark ? '' : 'on-light'}`} href="#/welcome" aria-label="Kolekt home page">
      <span className="logo-mark" aria-hidden="true">
        K
      </span>
      <span className="brand-name">Kolekt</span>
    </a>
  )
}

export function Header({ title, back, action }: { title: string; back?: boolean; action?: ReactNode }) {
  return (
    <header className="hdr">
      {back ? (
        <button className="icon-btn" aria-label="Go back" onClick={() => history.back()}>
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
      ) : (
        <span className="logo-mark sm" aria-hidden="true">
          K
        </span>
      )}
      <h1>{title}</h1>
      <div className="hdr-action">{action}</div>
    </header>
  )
}

const tabs: { route: Route; label: string; Icon: typeof HomeIcon }[] = [
  { route: { name: 'home' }, label: 'Home', Icon: HomeIcon },
  { route: { name: 'debts' }, label: 'Debts', Icon: BookOpen },
  { route: { name: 'customers' }, label: 'Customers', Icon: Users },
  { route: { name: 'settings' }, label: 'More', Icon: Cog },
]

export function BottomNav({ current }: { current: Route['name'] }) {
  return (
    <nav className="nav" aria-label="App sections">
      {tabs.map(({ route, label, Icon }) => (
        <button key={label} className={current === route.name ? 'on' : ''} aria-current={current === route.name ? 'page' : undefined} onClick={() => go(route)}>
          <Icon size={22} aria-hidden="true" />
          {label}
        </button>
      ))}
    </nav>
  )
}

export function Fab({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button className="fab" onClick={onClick}>
      <Plus size={20} aria-hidden="true" /> {label}
    </button>
  )
}

export function DueBadge({ debt }: { debt: Debt }) {
  return <span className={`badge due-${dueState(debt)}`}>{dueLabel(debt)}</span>
}

export function TrustBadge({ trust }: { trust: Trust }) {
  return (
    <span className={`badge trust-${trust.tone}`}>
      {trust.label}
      {trust.onTimePct !== null ? ` · ${trust.onTimePct}%` : ''}
    </span>
  )
}

export function DebtRow({ debt, customerName }: { debt: Debt; customerName: string }) {
  return (
    <button className="row" onClick={() => go({ name: 'debt', id: debt.id })} aria-label={`${customerName}, ${debt.item}, owes ${naira(balanceOf(debt))}, ${dueLabel(debt)}`}>
      <div className="avatar" aria-hidden="true">
        {initials(customerName)}
      </div>
      <div className="row-main">
        <strong>{customerName}</strong>
        <span className="muted">{debt.item}</span>
      </div>
      <div className="row-end">
        <strong>{naira(balanceOf(debt))}</strong>
        <DueBadge debt={debt} />
      </div>
    </button>
  )
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('button, input, a')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" aria-hidden="true" />
        <div className="row-between">
          <h2 id="sheet-title">{title}</h2>
          <button className="link-btn" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Empty({ icon, title, text, children }: { icon: ReactNode; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <p className="muted">{text}</p>
      {children}
    </div>
  )
}

export function Footer() {
  return (
    <footer className="l-footer">
      <div className="l-footer-inner">
        <div>
          <Logo />
          <p>Credit sales and polite WhatsApp reminders for Nigerian sellers.</p>
        </div>
        <div>
          <h2>Business details</h2>
          <p>
            {business.name} is operated by {business.operator}, {business.country}.
            {business.cacNumber ? ` CAC ${business.cacNumber}.` : ''}
          </p>
          <p>
            Support:{' '}
            <a href={waContact()} target="_blank" rel="noreferrer">
              WhatsApp {business.whatsappDisplay}
            </a>
          </p>
        </div>
        <div>
          <h2>Legal</h2>
          <ul>
            <li>
              <a href="#/privacy">Privacy policy</a>
            </li>
            <li>
              <a href="#/terms">Terms of use</a>
            </li>
            <li>
              <a href="#/refunds">Refund policy</a>
            </li>
            <li>
              <a href="#/cookies">Cookies policy</a>
            </li>
          </ul>
        </div>
      </div>
      <p className="l-copy">© {new Date().getFullYear()} {business.name}. Not a loan app. Kolekt never lends, holds or moves money.</p>
    </footer>
  )
}

export function toast(msg: string) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.setAttribute('role', 'status')
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2600)
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?'
