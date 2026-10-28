import type { Customer, Debt, Settings } from './store'
import { balanceOf, debtRef, naira, paidOf, prettyDate } from './utils'

// Draws a branded receipt as a PNG so sellers can post it straight into WhatsApp.
export async function receiptImage(debt: Debt, customer: Customer, s: Settings): Promise<Blob> {
  const W = 720
  const H = 1020
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const font = (size: number, weight = 400) => `${weight} ${size}px "Segoe UI", Roboto, Arial, sans-serif`

  g.fillStyle = '#f6f7f5'
  g.fillRect(0, 0, W, H)
  g.fillStyle = '#0b3d30'
  g.fillRect(0, 0, W, 200)
  g.fillStyle = '#7fe0b8'
  g.font = font(22, 700)
  g.fillText(isPaid(debt) ? 'PAYMENT RECEIPT' : 'BALANCE NOTICE', 48, 70)
  g.fillStyle = '#ffffff'
  g.font = font(44, 800)
  g.fillText(clip(g, s.businessName || 'My Business', W - 96), 48, 128)
  g.font = font(22)
  g.fillStyle = '#cfe9de'
  g.fillText(prettyDate(new Date().toISOString()), 48, 170)

  const rows: [string, string][] = [
    ['Customer', customer.name],
    ['Item', debt.item],
    ['Total', naira(debt.amount)],
    ['Paid', naira(paidOf(debt))],
    ['Due date', prettyDate(debt.dueDate)],
    ['Reference', debtRef(debt)],
  ]
  let y = 270
  for (const [k, v] of rows) {
    g.fillStyle = '#6b6a66'
    g.font = font(24)
    g.fillText(k, 48, y)
    g.fillStyle = '#111111'
    g.font = font(28, 600)
    const t = clip(g, v, W - 320)
    g.fillText(t, W - 48 - g.measureText(t).width, y)
    g.strokeStyle = '#e3e5e1'
    g.beginPath()
    g.moveTo(48, y + 24)
    g.lineTo(W - 48, y + 24)
    g.stroke()
    y += 72
  }

  const bal = balanceOf(debt)
  g.fillStyle = bal === 0 ? '#e3f6ec' : '#fff3e0'
  roundRect(g, 48, y + 10, W - 96, 150, 24)
  g.fill()
  g.fillStyle = '#52514e'
  g.font = font(24, 600)
  g.fillText(bal === 0 ? 'Fully paid — thank you!' : 'Balance remaining', 80, y + 62)
  g.fillStyle = bal === 0 ? '#0b7a5a' : '#b45309'
  g.font = font(56, 800)
  g.fillText(naira(bal), 80, y + 128)

  g.fillStyle = '#8a8984'
  g.font = font(20)
  if (s.payLink && bal > 0) g.fillText(clip(g, 'Pay: ' + s.payLink, W - 96), 48, H - 90)
  g.fillText('Made with Kolekt', 48, H - 50)

  return new Promise((res) => c.toBlob((b) => res(b!), 'image/png'))
}

const isPaid = (d: Debt) => balanceOf(d) === 0

function clip(g: CanvasRenderingContext2D, text: string, max: number) {
  if (g.measureText(text).width <= max) return text
  let t = text
  while (t.length > 1 && g.measureText(t + '…').width > max) t = t.slice(0, -1)
  return t + '…'
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

// Share through the phone's share sheet (WhatsApp etc.), or download as a fallback.
export async function shareImage(blob: Blob, filename: string, text: string) {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return
    } catch {
      // User cancelled the share sheet; fall through to download.
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
