import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { register } from 'node:module'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

// WAVE 2B.2 — WHO IS AT EACH END OF A /send DELIVERY.
//
// Behavioural tests call the real lib/endpoint-contacts.mjs and the real buildOrderPayload.
// Source assertions cover the React components node --test cannot execute, bounded to the claim.
register(
  new URL('./helpers/module-alias-hooks.mjs', import.meta.url).href,
  import.meta.url,
)

const contacts = await import('../src/lib/endpoint-contacts.mjs')
const { buildOrderPayload } = await import(
  '../src/components/send/buildOrderPayload.js'
)

const read = (p) =>
  readFileSync(
    fileURLToPath(new URL(`../${p}`, import.meta.url)),
    'utf8',
  ).replaceAll('\r\n', '\n')

const base = {
  pickupContactType: null,
  pickupOrganization: '',
  dropoffContactType: null,
  receiverOrganization: '',
  deliveryPreference: 'recipient_handoff',
  senderName: '',
  senderPhone: '',
  senderEmail: '',
  senderNote: '',
  receiverName: '',
  receiverPhone: '',
  receiverEmail: '',
  receiverNote: '',
}
const c = (over) => ({ ...base, ...over })

const payload = (contact, over = {}) =>
  buildOrderPayload({
    flow: {
      pickup: { lat: 43.65, lng: -79.38, address: '1 Store St' },
      dropoff: { lat: 43.7, lng: -79.4, address: '2 Office Ave' },
      pickupTiming: 'instant',
      scheduledPickupAt: null,
      vehicle: 'car',
      packageCount: 1,
      weight: 'light',
      section: 'other',
      ...over,
      contact,
    },
    quote: { distanceKm: 5 },
    paymentIntentId: 'pi_2b2',
  })

// ── contract ───────────────────────────────────────────────────────────────────────────────
test('vocabularies match Wave 2B.1; safe_drop is not a contact type', () => {
  assert.deepEqual(
    [...contacts.PICKUP_CONTACT_TYPES],
    ['requester', 'person', 'business'],
  )
  assert.deepEqual(
    [...contacts.DROPOFF_CONTACT_TYPES],
    ['requester', 'person', 'business', 'anyone'],
  )
  assert.deepEqual(
    [...contacts.DELIVERY_PREFERENCES],
    ['recipient_handoff', 'safe_drop'],
  )
  assert.equal(
    contacts.DROPOFF_OPTIONS.some((o) => o.value === 'safe_drop'),
    false,
  )
})

test('nothing is preselected: the flow starts with neither end chosen', () => {
  const flow = read('src/lib/send-flow.js')
  assert.match(flow, /pickupContactType: null,/)
  assert.match(flow, /dropoffContactType: null,/)
  assert.ok(contacts.validatePickup(base).pickupContactType)
  assert.ok(contacts.validateDropoff(base).dropoffContactType)
})

// ── requester ≠ pickup, requester ≠ recipient ──────────────────────────────────────────────
test('requester ≠ pickup: someone else hands it over and the booker receives it', () => {
  const p = payload(
    c({
      pickupContactType: 'person',
      senderName: 'Sam Clerk',
      senderPhone: '+14165550001',
      dropoffContactType: 'requester',
      receiverName: 'Ada Booker',
      receiverPhone: '+14165550002',
    }),
  )
  assert.deepEqual([p.pickupContactType, p.senderName], ['person', 'Sam Clerk'])
  assert.deepEqual(
    [p.receivers[0].dropoffContactType, p.receivers[0].receiverName],
    ['requester', 'Ada Booker'],
  )
  assert.equal(p.bookingDirection, 'receive')
})

test('requester ≠ recipient: the booker hands over, a named person receives', () => {
  const p = payload(
    c({
      pickupContactType: 'requester',
      senderName: 'Ada Booker',
      senderPhone: '+14165550002',
      dropoffContactType: 'person',
      receiverName: 'Kai',
      receiverEmail: 'kai@example.test',
    }),
  )
  assert.equal(p.bookingDirection, 'send')
  assert.equal(p.receivers[0].receiverEmail, 'kai@example.test')
  assert.equal('receiverPhone' in p.receivers[0], false)
})

test('booker at neither end: business → business is third_party with no fake identity', () => {
  const p = payload(
    c({
      pickupContactType: 'business',
      pickupOrganization: 'Store A',
      senderPhone: '+14165550003',
      dropoffContactType: 'business',
      receiverOrganization: 'Office B',
      receiverPhone: '+14165550004',
    }),
  )
  assert.equal(p.bookingDirection, 'third_party')
  assert.deepEqual([p.pickupOrganization, p.senderName], ['Store A', 'Store A'])
  assert.deepEqual(
    [p.receivers[0].receiverOrganization, p.receivers[0].receiverName],
    ['Office B', 'Office B'],
  )
})

// ── business pickup / business recipient / anyone ──────────────────────────────────────────
test('business pickup: organization required, individual optional, desk phone required', () => {
  const errors = contacts.validatePickup(c({ pickupContactType: 'business' }))
  assert.deepEqual(Object.keys(errors).sort(), [
    'pickupOrganization',
    'senderPhone',
  ])
  const named = contacts.pickupIdentity(
    c({
      pickupContactType: 'business',
      pickupOrganization: 'Store A',
      senderName: 'Jo',
      senderPhone: '1',
    }),
  )
  assert.deepEqual(
    [named.senderName, named.pickupOrganization],
    ['Jo', 'Store A'],
  )
})

test('business recipient: organization required, phone or email, no fake individual', () => {
  assert.deepEqual(
    Object.keys(
      contacts.validateDropoff(
        c({ dropoffContactType: 'business', receiverEmail: 'desk@b.example' }),
      ),
    ),
    ['receiverOrganization'],
  )
})

test('anyone recipient: the name on the package is required because the backend requires receiverName', () => {
  assert.equal(
    contacts.validateDropoff(
      c({ dropoffContactType: 'anyone', receiverPhone: '1' }),
    ).receiverName,
    'Add the name the package is addressed to.',
  )
  const p = payload(
    c({
      pickupContactType: 'requester',
      senderName: 'Ada',
      senderPhone: '1',
      dropoffContactType: 'anyone',
      receiverName: 'The Lee household',
      receiverPhone: '2',
    }),
  )
  assert.deepEqual(
    [p.receivers[0].dropoffContactType, p.receivers[0].receiverName],
    ['anyone', 'The Lee household'],
  )
})

test('organization is never sent for a non-business contact', () => {
  const p = payload(
    c({
      pickupContactType: 'person',
      pickupOrganization: 'Stale',
      senderName: 'S',
      senderPhone: '1',
      dropoffContactType: 'person',
      receiverOrganization: 'Stale',
      receiverName: 'R',
      receiverPhone: '2',
    }),
  )
  assert.equal('pickupOrganization' in p, false)
  assert.equal('receiverOrganization' in p.receivers[0], false)
})

// ── safe drop ──────────────────────────────────────────────────────────────────────────────
test('safe drop is a separate field, sent only for the general section', () => {
  const contact = c({
    pickupContactType: 'requester',
    senderName: 'A',
    senderPhone: '1',
    dropoffContactType: 'anyone',
    receiverName: 'Unit 4',
    receiverPhone: '2',
    deliveryPreference: 'safe_drop',
  })
  assert.deepEqual(
    [
      payload(contact).receivers[0].dropoffContactType,
      payload(contact).receivers[0].deliveryPreference,
    ],
    ['anyone', 'safe_drop'],
  )
  for (const section of ['legal_document', 'medical_supply']) {
    assert.equal(contacts.safeDropOffered(section), false, section)
    assert.equal(
      'deliveryPreference' in payload(contact, { section }).receivers[0],
      false,
      section,
    )
  }
})

test('the safe-drop control is hidden unless offered and is worded as a request', () => {
  const fields = read('src/components/send/ContactFields.jsx')
  assert.match(fields, /safeDropOffered\(section\) && dropoffType && \(/)
  assert.match(fields, /Safe drop, if permitted/)
  assert.match(fields, /The driver may still need to hand it to someone\./)
})

// ── validation / placeholders ──────────────────────────────────────────────────────────────
test('person validation: pickup needs a phone; drop-off needs a phone or an email', () => {
  assert.ok(
    contacts.validatePickup(
      c({
        pickupContactType: 'person',
        senderName: 'S',
        senderEmail: 's@x.example',
      }),
    ).senderPhone,
  )
  assert.equal(
    contacts.isComplete(
      contacts.validateDropoff(
        c({
          dropoffContactType: 'person',
          receiverName: 'R',
          receiverEmail: 'r@x.example',
        }),
      ),
    ),
    true,
  )
  assert.ok(
    contacts.validateDropoff(
      c({
        dropoffContactType: 'person',
        receiverName: 'R',
        receiverEmail: 'nope',
      }),
    ).receiverEmail,
  )
})

test('no placeholder values: blank input stays blank in every identity field', () => {
  for (const type of contacts.PICKUP_CONTACT_TYPES) {
    const id = contacts.pickupIdentity(c({ pickupContactType: type }))
    assert.deepEqual([id.senderName, id.senderPhone], ['', ''], type)
  }
  for (const type of contacts.DROPOFF_CONTACT_TYPES) {
    assert.equal(
      contacts.dropoffIdentity(c({ dropoffContactType: type })).receiverName,
      '',
      type,
    )
  }
  for (const rel of [
    'src/lib/endpoint-contacts.mjs',
    'src/components/send/ContactFields.jsx',
    'src/components/send/buildOrderPayload.js',
  ]) {
    const code = read(rel).replace(/^\s*\/\/.*$/gm, '')
    assert.doesNotMatch(code, /['"](Anyone|N\/A|Front Desk|Unknown)['"]/, rel)
    assert.doesNotMatch(code, /0{7,}/, rel)
  }
})

// ── get-fee and POST /order describe the same contacts ─────────────────────────────────────
test('get-fee and the order body use the same identity helpers', () => {
  const pay = read('src/app/send/pay/page.jsx')
  assert.match(pay, /\.\.\.pickupIdentity\(contact\),/)
  assert.match(
    pay,
    /\.\.\.dropoffIdentity\(contact, \{ section: flow\.section \}\),/,
  )
  const builder = read('src/components/send/buildOrderPayload.js')
  assert.match(builder, /\.\.\.pickupIdentity\(contact\),/)
  assert.match(
    builder,
    /\.\.\.dropoffIdentity\(contact, \{ section: flow\.section \}\),/,
  )
})

// ── copy / review ──────────────────────────────────────────────────────────────────────────
test('pickup copy is endpoint-specific; "Your name" appears only for the "Me" choice', () => {
  const fields = read('src/components/send/ContactFields.jsx')
  assert.match(fields, /Who will give the package to the driver\?/)
  assert.match(fields, /Who should receive the package\?/)
  assert.match(
    fields,
    /pickupType === 'requester'\s*\?\s*'Your name'\s*:\s*'Contact name'/,
  )
  assert.doesNotMatch(fields, /label="Your name"|label="Your phone"/)
})

test('review restates each end with an edit action; native radios carry state', () => {
  const fields = read('src/components/send/ContactFields.jsx')
  assert.match(fields, /export function ContactSummary/)
  assert.match(fields, /Edit contacts/)
  assert.match(fields, /type="radio"/)
  assert.match(fields, /<legend/)
  assert.match(fields, /aria-invalid/)
  assert.match(fields, /role="alert"/)
  assert.match(
    read('src/app/send/pay/page.jsx'),
    /<ContactSummary contact=\{flow\.contact\} section=\{flow\.section\} \/>/,
  )
})

test('no PIN / proof-of-delivery UI arrives in this wave', () => {
  const code = read('src/components/send/ContactFields.jsx')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  assert.doesNotMatch(
    code,
    /Enter PIN|Resend PIN|Can't get PIN|Verify another way|signature|proof of delivery/i,
  )
})
