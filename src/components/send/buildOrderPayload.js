import { apiKeyFor } from '@/components/send/vehicles'
import { weightKgFor } from '@/lib/send-flow'
import {
  dropoffIdentity,
  pickupIdentity,
  resolveBookingDirection,
} from '@/lib/endpoint-contacts.mjs'

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

  // WHO receives: the drop-off contact (receiver*) plus the Wave 2B.1 metadata
  // describing it — built by the same helper get-fee uses, so the priced body and
  // the created order name the same contact. Phone / email / note are omitted
  // when blank; see dropoffIdentity.
  const receiver = {
    ...dropoffIdentity(contact, { section: flow.section }),
    receiverAddress: dropoff.address,
    receiverLocation: { latitude: dropoff.lat, longitude: dropoff.lng },
    // Required by the request validator even though the server recomputes it.
    // Send the BACKEND's distance (from quote-itemized), never Google's — the
    // two routing engines disagree and this value is what the fare was priced
    // from.
    distance: quote.distanceKm,
    // ⚠️ PRICED INPUT — SEE THE packageCount NOTE BELOW. Omitting this made the
    // server re-derive the fare with weight 0 and drop the $20 heavy surcharge.
    weight: weightKgFor(flow.weight),
  }

  // At least one of phone/email is required, and receiverNote is the existing
  // delivery-point note the mobile app sends and the driver app renders (see
  // EMPTY_STATE.contact in src/lib/send-flow.js). dropoffIdentity sends each only
  // when actually provided: an empty string reads as "supplied but blank".

  // ⚠️ TWO SIMILAR NAMES, TWO DIFFERENT CONTRACTS. DO NOT MIX THEM.
  //
  //   pickUpTime   capital U — POST /order (this payload). An absolute ISO instant,
  //                sent ONLY for a scheduled order.
  //   pickupTime   lowercase u — POST /drop-batch/public/quote. A different endpoint
  //                with its own DTO.
  //
  // The backend rejects `scheduled_pickup` without a future pickUpTime, and an
  // instant order must omit it entirely rather than send a placeholder — a stray
  // timestamp is what made the old column default meaningless.
  const isScheduled = flow.pickupTiming === 'scheduled' && !!flow.scheduledPickupAt

  const scheduling = isScheduled
    ? { type: 'scheduled_pickup', pickUpTime: flow.scheduledPickupAt }
    : { type: 'instant_pickup' }

  return {
    // This selects a server pricing branch, never a client amount. POST /order
    // independently recalculates the route and fare and verifies Stripe cents.
    pricingMode:
      flow.pricingMode === 'dropbatch' ? 'dropbatch' : 'standard',
    senderLocation: { latitude: pickup.lat, longitude: pickup.lng },
    senderAddress: pickup.address,
    // WHO hands the package over: the pickup contact (sender*) plus the Wave 2B.1
    // metadata describing it. Same helper as the get-fee body.
    ...pickupIdentity(contact),
    // A1 — THE BOOKING DIRECTION, NOW STATED BY THE CUSTOMER'S OWN CONTACT CHOICES.
    //
    // It used to be the literal 'send' because this form assumed the booker was the pickup
    // contact. Wave 2B.2 makes the booker say who is at each end, so the direction is what
    // those STATED choices mean under the backend's definitions: 'send' when the booker is
    // the pickup contact, 'receive' when they are the drop-off contact, 'third_party' when
    // both contacts are other people. Not an inference from names or phone numbers — only
    // from the two explicit choices. See resolveBookingDirection.
    //
    // Server contract: optional, @IsIn(['send','receive','third_party']), case-sensitive, NO
    // default. Never an explicit null: the DTO rejects it (@ValidateIf keys on undefined).
    bookingDirection: resolveBookingDirection(contact),
    ...scheduling,
    // Normalised key ('cargovan', never the local 'cargo' id).
    vehicle: apiKeyFor(flow.vehicle),
    // ⚠️ EVERY PRICED INPUT MUST APPEAR HERE. POST /order does NOT trust the
    // amount already charged — it RE-DERIVES the fare from this payload
    // (OrderService.create → calculateFee, feeOnly:true) and rejects the order
    // if the result does not match the PaymentIntent to the cent.
    //
    // packageCount and receivers[].weight were both missing. The DTO defaults
    // them to 1 and 0, so the server re-priced a 5-package 25 kg delivery as a
    // 1-package 0 kg one and rejected it — AFTER the card was charged. Every
    // order with 2+ packages or a package over 15 kg failed that way, leaving
    // the customer paid with no delivery.
    //
    // Worked example, car, from the current rate table. STATE THE DISTANCE when
    // quoting these numbers: the shortfall is the extra-package and heavy
    // components, which do NOT vary with distance, so the same defect shows
    // different totals per trip and looks inconsistent when the distance is left
    // out.
    //   10 km: charged $68.50, re-derived $16.50
    //    5 km: charged $64.25, re-derived $12.25
    // Both are a $52.00 shortfall — 4 × $8 extra-package + $20 heavy.
    //
    // The rule this encodes: anything paymentInputsHash covers is an input the
    // fare depends on, so it belongs in this payload too. Adding a priced
    // option (dimensions, a service tier) without adding it here reopens
    // exactly this failure.
    packageCount: flow.packageCount,
    // 'other' for general consumer packages, unless a ?section= preset set one
    // of the other whitelisted values on step 1.
    section: flow.section ?? 'other',
    receivers: [receiver],
    // ← THE RENAME. paymentIntentId (get-fee) becomes paymentIntent (POST /order).
    paymentIntent: paymentIntentId,
  }
}
