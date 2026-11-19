// Adopted, test-only, from the fresh-context D7c review runtime harness.
// Presentational stand-in: exposes the real flow.setContactField to the scenario so a test can
// "type" into the contact form exactly as the real inputs would (same callback).
import { createElement } from 'react'

export function ContactFields({ contact, onChange }) {
  globalThis.__T.contactOnChange = onChange
  globalThis.__T.lastContact = contact
  return createElement('div', { 'data-fake': 'contact-fields' })
}
