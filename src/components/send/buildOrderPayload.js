import { apiKeyFor } from '@/components/send/vehicles'

// The one and only place the POST /order body is constructed.
//
// ⚠️ THE RENAME LIVES HERE AND NOWHERE ELSE ⚠️
//
// get-fee returns the intent as `paymentIntentId`.
// POST /order expects it as `paymentIntent`.
//
// This is the single most dangerous field in the flow. It is only ever sent
// AFTER the customer's card has been charged, so if the name is wrong the
// order creation fails on an already-paid intent: money taken, no delivery, no
// tracking code, and a customer holding a Stripe receipt for something that
// does not exist. Keeping the rename in one named function means there is
// exactly one line to audit, rather than a spread across call sites where a
// copy-paste can silently drop it.
//
// Do not inline this mapping at a call site. Do not add a second one.

export function buildOrderPayload({ flow, quote, paymentIntentId }) {
  const { pickup, dropoff, contact } = flow

  const receiver = {
    receiverName: contact.receiverName.trim(),
    receiverAddress: dropoff.address,
    receiverLocation: { latitude: dropoff.lat, longitude: dropoff.lng },
    // Required by the request validator even though the server recomputes it.
    // Send the BACKEND's distance (from quote-itemized), never Google's — the
    // two routing engines disagree and this value is what the fare was priced
    // from.
    distance: quote.distanceKm,
  }

  // At least one of phone/email is required. Only send what was actually
  // provided rather than empty strings, which can read as "supplied but blank".
  if (contact.receiverPhone.trim()) {
    receiver.receiverPhone = contact.receiverPhone.trim()
  }

  if (contact.receiverEmail.trim()) {
    receiver.receiverEmail = contact.receiverEmail.trim()
  }

  // Optional delivery note, omitted entirely when blank for the same reason as
  // phone/email above: an empty string reads as "supplied but blank" to anyone
  // reading the order, and the column is nullable.
  //
  // Same property name the mobile app sends and the driver app renders — this is
  // parity on an existing contract, not a new field. See EMPTY_STATE.contact in
  // src/lib/send-flow.js for the full trace.
  if (contact.receiverNote?.trim()) {
    receiver.receiverNote = contact.receiverNote.trim()
  }

  return {
    senderLocation: { latitude: pickup.lat, longitude: pickup.lng },
    senderAddress: pickup.address,
    senderName: contact.senderName.trim(),
    senderPhone: contact.senderPhone.trim(),
    // Normalised key ('cargovan', never the local 'cargo' id).
    vehicle: apiKeyFor(flow.vehicle),
    // 'other' for general consumer packages, unless a ?section= preset set one
    // of the other whitelisted values on step 1.
    section: flow.section ?? 'other',
    receivers: [receiver],
    // ← THE RENAME. paymentIntentId (get-fee) becomes paymentIntent (POST /order).
    paymentIntent: paymentIntentId,
  }
}
