import { useEffect, type ReactNode } from 'react'
import type { Debt } from './store'
import { balanceOf, dueLabel, dueState, naira, type Trust } from './utils'
import { go, type Route } from './router'

export function Header({ title, back, action }: { title: string; back?: boolean; action?: ReactNode }) {
  return (
    <header className="hdr">
      {back ? (
        <button className="icon-btn" aria-label="Back" onClick={() => history.back()}>
          ←
        </button>
      ) : (
        <span className="logo" aria-hidden>
          ₦
        </span>
      )}
      <h1>{title}</h1>
      <div className="hdr-action">{action}</div>
    </header>
  )
}

const tabs: { route: Route; label: string; icon: string }[] = [
  { route: { name: 'home' }, label: 'Home', icon: '🏠' },
  { route: { name: 'debts' }, label: 'Debts', icon: '📒' },
  { route: { name: 'customers' }, label: 'Customers', icon: '👥' },
  { route: { name: 'settings' }, label: 'More', icon: '⚙️' },
]

export function BottomNav({ current }: { current: Route['name'] }) {
  return (
    <nav className="nav">
      {tabs.map((t) => (
        <button key={t.label} className={current === t.route.name ? 'on' : ''} onClick={() => go(t.route)}>
          <span aria-hidden>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}

export function Fab({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button className="fab" onClick={onClick}>
      + {label}
    </button>
  )
}

export function DueBadge({ debt }: { debt: Debt }) {
  return <span className={`badge due-${dueState(debt)}`}>{dueLabel(debt)}</span>
}

export function TrustBadge({ trust }: { trust: Trust }) {
  return (
    <span className={`badge trust-${trust.tone}`}>
      {trust.tone === 'good' ? '⭐ ' : ''}
      {trust.label}
      {trust.onTimePct !== null ? ` · ${trust.onTimePct}%` : ''}
    </span>
  )
}

export function DebtRow({ debt, customerName }: { debt: Debt; customerName: string }) {
  return (
    <button className="row" onClick={() => go({ name: 'debt', id: debt.id })}>
      <div className="avatar">{initials(customerName)}</div>
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
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function Empty({ icon, title, text, children }: { icon: string; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p className="muted">{text}</p>
      {children}
    </div>
  )
}

export function toast(msg: string) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2400)
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?'
