// ENDPOINT CONTACTS — who the driver physically deals with at each end of a /send delivery.
//
// ⚠️ THE PERSON FILLING IN THIS FORM IS NOT ASSUMED TO BE AT EITHER END. They state, separately and
// explicitly, who hands the package over at pickup and who receives it at drop-off. Nothing is
// preselected. (This page used to say "Your name / Your phone" for the pickup, which made the
// booker the pickup contact whether or not they would be there.)
//
// ⚠️ NO SECOND CONTACT OBJECT. The contact stays in the fields POST /order has always used
// (sender* = pickup contact, receiver* = drop-off contact). The Wave 2B.1 metadata only says what
// KIND of party it is: pickupContactType / pickupOrganization on the order; dropoffContactType /
// receiverOrganization / deliveryPreference on the delivery point. A backend without that contract
// strips the unknown fields (global whitelist), so sending them early is harmless.
//
// ⚠️ SAFE DROP IS NOT A CONTACT TYPE. It is a delivery METHOD the customer may REQUEST; the server's
// verification policy decides whether it is ever honoured.
//
// ⚠️ NO PLACEHOLDERS. POST /order still requires senderName, senderPhone and receiverName for every
// contact type, and a phone or email per stop. Where a type has no individual (business, anyone),
// the value sent is one the customer typed — the business name, or the name on the package — never
// "Anyone", "N/A", "Front desk" or an invented number.

export const PICKUP_CONTACT_TYPES = Object.freeze([
  'requester',
  'person',
  'business',
])
export const DROPOFF_CONTACT_TYPES = Object.freeze([
  'requester',
  'person',
  'business',
  'anyone',
])
export const DELIVERY_PREFERENCES = Object.freeze([
  'recipient_handoff',
  'safe_drop',
])

// Mirrors the backend's ENDPOINT_ORGANIZATION_MAX_LENGTH.
export const ORGANIZATION_MAX_LENGTH = 160
// Mirrors the backend's IsEmailOrEmpty shape check — a validation, not a normalisation.
const EMAIL_SHAPE = /\S+@\S+\.\S+/

// Only whitespace is removed; real contact details are never rewritten.
const clean = (value) => (typeof value === 'string' ? value.trim() : '')

export const PICKUP_OPTIONS = Object.freeze([
  {
    value: 'requester',
    label: 'Me',
    description: "I'll hand the package to the driver",
  },
  {
    value: 'person',
    label: 'Someone else',
    description: 'Another person will hand it over',
  },
  {
    value: 'business',
    label: 'Business / front desk',
    description: 'A store, office or reception desk',
  },
])

export const DROPOFF_OPTIONS = Object.freeze([
  { value: 'requester', label: 'Me', description: "I'll receive the package" },
  {
    value: 'person',
    label: 'Specific person',
    description: 'A named person will receive it',
  },
  {
    value: 'business',
    label: 'Business / front desk',
    description: 'A business, mailroom or reception desk',
  },
  {
    value: 'anyone',
    label: 'Anyone at this address',
    description:
      'Whoever is there can take it — someone still has to receive it',
  },
])

/**
 * Safe drop is offered only where the server policy can honour it. On /send that is the general
 * consumer section; legal documents and medical supplies never offer it.
 */
export function safeDropOffered(section) {
  return (section ?? 'other') === 'other'
}

function emailAndOrganization(errors, email, organization) {
  if (clean(email) && !EMAIL_SHAPE.test(clean(email)))
    errors.email = 'Enter a valid email address.'
  if (clean(organization).length > ORGANIZATION_MAX_LENGTH) {
    errors.organization = `Keep the business name under ${ORGANIZATION_MAX_LENGTH} characters.`
  }
  return errors
}

/** Field-level errors for the pickup contact; an empty object means valid. */
export function validatePickup(contact) {
  const errors = {}
  const type = contact?.pickupContactType
  if (!PICKUP_CONTACT_TYPES.includes(type)) {
    errors.pickupContactType = 'Choose who will give the package to the driver.'
    return errors
  }
  if (type === 'business') {
    if (!clean(contact.pickupOrganization))
      errors.pickupOrganization = 'Add the business name.'
  } else if (!clean(contact.senderName)) {
    errors.senderName =
      type === 'requester' ? 'Add your name.' : "Add the pickup contact's name."
  }
  // POST /order requires a pickup phone for every contact type; for a business, the desk number.
  if (!clean(contact.senderPhone)) {
    errors.senderPhone =
      type === 'business'
        ? 'Add a phone number for the business or front desk.'
        : 'Add a phone number the driver can reach at pickup.'
  }
  const e = emailAndOrganization(
    {},
    contact.senderEmail,
    contact.pickupOrganization,
  )
  if (e.email) errors.senderEmail = e.email
  if (e.organization) errors.pickupOrganization = e.organization
  return errors
}

/** Field-level errors for the drop-off contact; an empty object means valid. */
export function validateDropoff(contact) {
  const errors = {}
  const type = contact?.dropoffContactType
  if (!DROPOFF_CONTACT_TYPES.includes(type)) {
    errors.dropoffContactType = 'Choose who should receive this delivery.'
    return errors
  }
  if (type === 'business') {
    if (!clean(contact.receiverOrganization)) {
      errors.receiverOrganization = 'Add the receiving business name.'
    }
  } else if (!clean(contact.receiverName)) {
    errors.receiverName = {
      requester: 'Add your name.',
      person: "Add the recipient's name.",
      anyone: 'Add the name the package is addressed to.',
    }[type]
  }
  if (!clean(contact.receiverPhone) && !clean(contact.receiverEmail)) {
    errors.receiverPhone = 'Add a phone number or email for this delivery.'
  }
  const e = emailAndOrganization(
    {},
    contact.receiverEmail,
    contact.receiverOrganization,
  )
  if (e.email) errors.receiverEmail = e.email
  if (e.organization) errors.receiverOrganization = e.organization
  return errors
}

export const isComplete = (errors) => Object.keys(errors).length === 0

/**
 * The pickup identity block, shared by get-fee and POST /order so the priced body and the created
 * order can never describe different contacts. A business with no named individual is addressed by
 * the business name the customer typed.
 */
export function pickupIdentity(contact) {
  const type = contact?.pickupContactType
  const organization =
    type === 'business' ? clean(contact.pickupOrganization) : ''
  const email = clean(contact?.senderEmail)
  const note = clean(contact?.senderNote)
  return {
    senderName: clean(contact?.senderName) || organization,
    senderPhone: clean(contact?.senderPhone),
    ...(email ? { senderEmail: email } : {}),
    ...(note ? { senderNote: note } : {}),
    ...(PICKUP_CONTACT_TYPES.includes(type) ? { pickupContactType: type } : {}),
    ...(organization ? { pickupOrganization: organization } : {}),
  }
}

/**
 * The drop-off identity block for ONE delivery point. Phone, email and note are omitted when blank
 * (an empty string reads as "supplied but blank"). deliveryPreference only when it was offered.
 */
export function dropoffIdentity(contact, { section } = {}) {
  const type = contact?.dropoffContactType
  const organization =
    type === 'business' ? clean(contact.receiverOrganization) : ''
  const phone = clean(contact?.receiverPhone)
  const email = clean(contact?.receiverEmail)
  const note = clean(contact?.receiverNote)
  const preference =
    safeDropOffered(section) &&
    DELIVERY_PREFERENCES.includes(contact?.deliveryPreference)
      ? contact.deliveryPreference
      : null
  return {
    receiverName: clean(contact?.receiverName) || organization,
    ...(phone ? { receiverPhone: phone } : {}),
    ...(email ? { receiverEmail: email } : {}),
    ...(note ? { receiverNote: note } : {}),
    ...(DROPOFF_CONTACT_TYPES.includes(type)
      ? { dropoffContactType: type }
      : {}),
    ...(organization ? { receiverOrganization: organization } : {}),
    ...(preference ? { deliveryPreference: preference } : {}),
  }
}

/**
 * bookingDirection from the stated contacts, using the backend's definitions: 'send' when the booker
 * is the pickup contact, 'receive' when they are the drop-off contact, 'third_party' when both
 * contacts are other people. Booker at both ends, or nothing stated yet, stays 'send' — the /send
 * form's own meaning.
 */
export function resolveBookingDirection(contact) {
  const atPickup = contact?.pickupContactType === 'requester'
  const atDropoff = contact?.dropoffContactType === 'requester'
  const stated =
    PICKUP_CONTACT_TYPES.includes(contact?.pickupContactType) &&
    DROPOFF_CONTACT_TYPES.includes(contact?.dropoffContactType)
  if (!stated || atPickup) return 'send'
  if (atDropoff) return 'receive'
  return 'third_party'
}

// ── DISPLAY ─────────────────────────────────────────────────────────────────────────────────

const PICKUP_LABELS = {
  requester: 'Pickup contact (you)',
  person: 'Pickup contact',
  business: 'Pickup business',
}
const DROPOFF_LABELS = {
  requester: 'Recipient (you)',
  person: 'Recipient',
  business: 'Receiving business',
  anyone: 'Anyone at this address',
}

export function describePickup(contact) {
  const identity = pickupIdentity(contact)
  const business = identity.pickupOrganization
  return {
    label: PICKUP_LABELS[contact?.pickupContactType] ?? 'Pickup contact',
    value:
      business && identity.senderName !== business
        ? `${business} · ${identity.senderName}`
        : identity.senderName,
  }
}

export function describeDropoff(contact, options) {
  const identity = dropoffIdentity(contact, options)
  const business = identity.receiverOrganization
  return {
    label: DROPOFF_LABELS[contact?.dropoffContactType] ?? 'Recipient',
    value:
      business && identity.receiverName !== business
        ? `${business} · ${identity.receiverName}`
        : identity.receiverName,
    preference:
      identity.deliveryPreference === 'safe_drop'
        ? 'Safe drop requested'
        : identity.deliveryPreference === 'recipient_handoff'
          ? 'Hand to recipient'
          : '',
  }
}
