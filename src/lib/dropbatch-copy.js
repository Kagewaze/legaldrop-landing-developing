// THE CANONICAL DROPBATCH EXPLANATION. One definition, imported by every public
// surface that offers or describes DropBatch, so the web cannot drift from the
// partner portal, the mobile app, or the backend that actually does the matching.
//
// ⚠️ WHY THIS FILE EXISTS AT ALL.
//
// DropBatch is NOT "cheaper standard delivery". The backend never exposes a
// DropBatch order to generic dispatch: canSearchForDriver() refuses it with
// `dropbatch_requires_posted_trip_offer`, and the driver jobs-board query
// excludes `pricingMode = 'dropbatch'` outright. A DropBatch order is matched by
// DropBatchService.matchPaidOrder against trips a verified driver has ALREADY
// POSTED — scored on vehicle, capacity, departure window and OSRM detour from
// that driver's existing route — and offered to that one driver for 10 minutes.
//
// Route sharing is therefore the whole product: it is why the price is lower and
// why pickup can take longer. A surface that omits it is not merely vague, it
// describes a fulfilment model Druppr does not operate. Between 2026-08-31 and
// 2026-09-08 the public pages said DropBatch "joins the normal Druppr driver job
// board"; that was true of an earlier build and is now flatly contradicted by the
// backend. Do not reintroduce job-board language here.
//
// The words below are load-bearing and are asserted by
// scripts/check-dropbatch-containment.mjs. Reword them freely, but the meaning
// must survive: an existing trip, a longer wait, and no promise of a driver.

export const DROPBATCH_HEADLINE =
  'Lower-cost delivery by matching your package with a driver already heading along your route.'

export const DROPBATCH_EXPLANATION =
  'Your package is matched with a verified Druppr driver whose existing trip is compatible with your pickup and destination. Because we need to find the right route match, pickup may take longer. Best for flexible, non-urgent deliveries.'

// Shown wherever DropBatch sits beside its alternative. The contrast is the
// decision: a trip that already exists versus a driver sent out for you.
export const STANDARD_EXPLANATION =
  'A driver is dispatched specifically for your delivery. Best when you need faster or more predictable pickup.'

// ⚠️ SELECTING DROPBATCH IS NOT A MATCH. Nothing may imply a driver has been
// found until order.dropBatchMatchStatus actually says so.
export const DROPBATCH_NO_PROMISE =
  'Choosing DropBatch starts the search — it does not mean a driver has been found yet. If no compatible trip is available, we keep looking and your order stays visible in tracking until a driver accepts.'

export const DROPBATCH_SHORT = 'Matched with a driver already heading your way'
