# Kolekt

Know who owes you. Get paid faster. A phone-first web app (PWA) for Nigerian WhatsApp and Instagram sellers who sell on credit.

Not a loan app: Kolekt never lends, holds or moves money. Payments go straight to the seller's own payment link or bank account.

## Features (v0.1, all free)

- Record a credit sale in ~10 seconds, with part-payment and quick due dates (Friday, 1 week, month end)
- Home dashboard: total owed, overdue, collected this month, "Chase today" list
- One-tap WhatsApp reminders (wa.me, so no API cost) in English or Pidgin, Friendly / Firm / Final tone picked automatically by lateness
- Seller's own payment link (Paystack, Flutterwave, Squad, Monnify...) in every reminder, plus a "verify before releasing goods" tip against fake alerts
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

## Turn on cloud backup and Pro (Supabase, free tier)

1. Create a project at supabase.com (pick the region closest to Nigeria, e.g. EU West).
2. SQL Editor > New query > paste `supabase/schema.sql` > Run.
3. Authentication > Sign In / Providers: keep Email on. Authentication > Emails > "Magic Link" template: add `{{ .Token }}` to the body so users get a 6-digit code.
4. Project Settings > API: copy the Project URL and the publishable key (or legacy `anon` key) into a new file `.env.local` (see `.env.example`). Never use the `service_role` key in the app.
5. Rebuild and deploy: `npm run build` then `npx wrangler@3.99.0 pages deploy dist --project-name kolekt --branch main`.
6. When someone pays for Pro: Table Editor > profiles > find their row (match the email in Authentication > Users) > set `pro_until` to the end date.

Until steps 1–5 are done the cloud section stays hidden and the app works phone-only.

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
