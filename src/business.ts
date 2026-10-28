import { config } from './config'

// Real operator details shown in the footer and legal pages. Update when you register a business name with CAC.
export const business = {
  name: 'Kolekt',
  operator: 'Divine Edikan',
  country: 'Nigeria',
  whatsapp: config.founderWhatsApp, // international format, no +
  whatsappDisplay: '+234 810 025 1672',
  cacNumber: '', // add your CAC BN number here once registered
  updated: 'October 2026',
}

export const waContact = (text = 'Hi Kolekt 👋') => `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`
