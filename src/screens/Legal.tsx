import type { ReactNode } from 'react'
import type { LegalPage } from '../router'
import { business, waContact } from '../business'
import { config } from '../config'
import { naira } from '../utils'
import { Footer, Logo } from '../components'

const titles: Record<LegalPage, string> = {
  privacy: 'Privacy policy',
  terms: 'Terms of use',
  refunds: 'Refund policy',
  cookies: 'Cookies policy',
}

const contact = (
  <a href={waContact('Hi Kolekt, I have a question about your policies')} target="_blank" rel="noreferrer">
    WhatsApp {business.whatsappDisplay}
  </a>
)

const pages: Record<LegalPage, ReactNode> = {
  privacy: (
    <>
      <p>
        <b>Short version:</b> Unless you turn on cloud backup, Kolekt keeps your records only on your phone. We never sell or share your data or your customers' details.
      </p>
      <h2>Who we are</h2>
      <p>
        Kolekt is operated by {business.operator} in {business.country}. Contact: {contact}.
      </p>
      <h2>What is stored, and where</h2>
      <p>
        Your business name, your payment link or bank details, your customers' names and WhatsApp numbers, and the sales and payments you record. All of it is saved in
        your browser's storage on your device. It is not sent to our servers unless you turn on cloud backup (below). We only ask for what the app needs to work.
      </p>
      <h2>What leaves your phone</h2>
      <p>
        Only what you choose to send. When you tap "Send on WhatsApp" or share a receipt, the message goes through WhatsApp or the app you pick, under their own privacy
        terms. Customers pay you directly through your own payment provider or bank. Kolekt never holds money.
      </p>
      <h2>Your customers' data</h2>
      <p>
        You are the data controller for your customers' details under the Nigeria Data Protection Act 2023. Only add customers who bought from you and agreed to hear from you
        about payment. Kolekt never messages anyone by itself and never contacts a customer's friends or contacts.
      </p>
      <h2>Tracking and analytics</h2>
      <p>The app uses no analytics, advertising trackers or third-party embeds. Our website host (Cloudflare) keeps standard server logs for security.</p>
      <h2>Your rights</h2>
      <p>
        You can view, correct or delete any record in the app at any time. To remove everything, clear this site's data in your browser settings. Back up first if you want to keep
        a copy.
      </p>
      <h2>Cloud backup (Pro, optional)</h2>
      <p>
        If you sign in for cloud backup, we store your email address and a copy of your Kolekt records with our database provider, Supabase, so you can restore them
        on another phone. Only you can read your backup: access is locked to your account. Sign out and ask us on WhatsApp to delete your account and backup at any time,
        and we will do so within 7 days. If you never sign in, nothing leaves your phone.
      </p>
      <h2>Changes</h2>
      <p>If we change how data is handled, we will update this page and show the new date at the top.</p>
    </>
  ),
  terms: (
    <>
      <p>By using Kolekt you agree to these terms. If you do not agree, please do not use the app.</p>
      <h2>What Kolekt is</h2>
      <p>
        A record-keeping tool for sellers. It helps you track credit sales and send reminders yourself. Kolekt is not a lender, bank, payment service or debt collector, and does not
        hold, move or guarantee any money.
      </p>
      <h2>Your responsibilities</h2>
      <ul>
        <li>Keep your records accurate and only record real sales.</li>
        <li>Only message customers who agreed to be contacted, and stay polite. Do not threaten, shame or harass anyone.</li>
        <li>Confirm payments in your bank or payment app before marking them paid or releasing goods.</li>
        <li>Back up your data. Records are stored on your device and can be lost if you clear your browser or lose your phone.</li>
      </ul>
      <h2>Payment links</h2>
      <p>Payments go through the provider you choose (for example Paystack, Flutterwave, Squad or Monnify) under that provider's terms. Kolekt is not part of the payment.</p>
      <h2>No warranty</h2>
      <p>Kolekt is provided "as is". We work hard to keep it reliable but cannot promise it will always be available or error-free.</p>
      <h2>Limitation of liability</h2>
      <p>
        To the extent the law allows, Kolekt is not liable for unpaid debts, lost records, or losses from fake payment alerts, provider outages or messages you send. If you pay for
        Pro, our total liability is limited to what you paid in the last 3 months.
      </p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>
      <h2>Contact</h2>
      <p>{contact}</p>
    </>
  ),
  refunds: (
    <>
      <p>
        <b>Kolekt is free.</b> You only pay if you choose Pro, which is not on sale yet.
      </p>
      <h2>When Pro launches</h2>
      <ul>
        <li>
          Plans are prepaid: {naira(config.prices.monthly)}/month, {naira(config.prices.quarterly)}/quarter or {naira(config.prices.yearly)}/year. They do not renew automatically.
        </li>
        <li>Changed your mind? Ask within 7 days of paying for a full refund.</li>
        <li>If a Pro feature you paid for does not work and we cannot fix it within 7 days, we refund the unused part of your plan.</li>
        <li>Refunds go back through the same payment provider, usually within 5–10 working days.</li>
        <li>Early-access offers (such as free months) have no cash value.</li>
      </ul>
      <h2>How to ask</h2>
      <p>Message {contact} with the name, phone number and date of payment.</p>
    </>
  ),
  cookies: (
    <>
      <p>
        <b>Kolekt does not use cookies</b> for tracking, analytics or advertising, so there is no cookie banner to accept.
      </p>
      <h2>What we use instead</h2>
      <p>
        The app saves your records in your browser's local storage, and stores app files so it can open offline. This is needed for the app to work and never leaves your device. If you sign in for cloud backup, a sign-in token is also kept in local storage so you stay signed in.
      </p>
      <h2>Third parties</h2>
      <p>
        We do not embed third-party scripts, fonts, videos or social widgets. When you open WhatsApp or a payment link, you leave Kolekt and that service's own cookie policy
        applies.
      </p>
      <h2>Changes</h2>
      <p>If we ever add analytics or cookies, we will ask for your consent first and update this page.</p>
    </>
  ),
}

export function Legal({ page }: { page: LegalPage }) {
  return (
    <div className="landing legal-page">
      <header className="l-header compact">
        <nav className="l-nav" aria-label="Main">
          <Logo />
          <button className="l-btn ghost-light small" onClick={() => history.back()}>
            Back
          </button>
        </nav>
      </header>
      <main className="legal-body" id="main">
        <p className="eyebrow">Last updated {business.updated}</p>
        <h1>{titles[page]}</h1>
        {pages[page]}
      </main>
      <Footer />
    </div>
  )
}
