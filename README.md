# Kolekt

Know who owes you. Get paid faster. A phone-first web app (PWA) for Nigerian WhatsApp and Instagram sellers who sell on credit.

Not a loan app: Kolekt never lends, holds or moves money. Payments go straight to the seller's own Paystack link.

## Features (v0.1, all free)

- Record a credit sale in ~10 seconds, with part-payment and quick due dates (Friday, 1 week, month end)
- Home dashboard: total owed, overdue, collected this month, "Chase today" list
- One-tap WhatsApp reminders (wa.me, so no API cost) in English or Pidgin, Friendly / Firm / Final tone picked automatically by lateness
- Seller's own Paystack payment link in every reminder, plus a "verify before releasing goods" tip against fake alerts
- Shareable receipt / balance-notice image
- Customer trust score (pays on time / sometimes late / often late)
- Customer statement over WhatsApp, call button, pick customer from phone contacts (Android Chrome)
- Works offline and installs to the home screen; dark mode
- Backup / restore file and Excel (CSV) export. Data lives only on the phone.

## Pricing

- Free forever: everything above.
- Pro (coming soon): ₦1,000/month, ₦2,400/quarter, ₦9,000/year. Cloud backup, logo on receipts, remove footer, reports, staff access. Similar apps charge ₦2,500–₦3,000/month.

Edit prices, your waitlist WhatsApp number and the Pro payment link in `src/config.ts`.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL on your phone (same Wi-Fi) to test. Tests: `npm test`. Production build: `npm run build` (output in `dist/`).

## Deploy free

Cloudflare Pages (free, commercial use allowed): connect the GitHub repo, build command `npm run build`, output folder `dist`. Every push redeploys, which works well when coding from a phone in GitHub Codespaces.

## Next steps (from the build plan)

1. Week 0: run it with 5 real sellers before adding more features.
2. Cloud sync with Supabase (the Pro feature).
3. Pro checkout with a Paystack payment page.

## Code map

- `src/store.ts` data model and local storage
- `src/utils.ts` money, dates, trust score, WhatsApp links
- `src/templates.ts` reminder and statement messages (English and Pidgin)
- `src/receipt.ts` receipt image
- `src/screens/` Home, Debts, AddDebt, Customers, Remind, Settings (plus Plans and Onboarding)
