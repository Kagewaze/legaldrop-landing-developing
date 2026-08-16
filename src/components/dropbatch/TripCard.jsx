import {
  capacityChips,
  formatDepartureDate,
  formatPackageSize,
  formatVehicle,
  formatWindow,
} from '@/lib/drop-batch'

// One trip from the public board.
//
// ⚠️ READ-ONLY BY CONSTRUCTION. The public projection carries no trip id, so
// there is nothing to link to and nothing to book. Do not add a CTA here — a
// button that cannot address a specific trip would be a dead control, and
// booking is an authenticated act that belongs in the app.
//
// ⚠️ EVERY FIELD BELOW COMES FROM THE API. Nothing is derived, inferred or
// padded: no distance, no price, no ETA, no "popular"/"filling fast" signal.
// If a card looks sparse, that is the honest amount the product knows.
export function TripCard({ trip }) {
  const when = [
    formatDepartureDate(trip.departureDate),
    formatWindow(trip.departureWindowStart, trip.departureWindowEnd),
  ]
    .filter(Boolean)
    .join(' · ')

  const chips = capacityChips(trip)

  // vehicle · up to <size> · fragile OK — the same secondary line mobile builds
  // (dropBatchBoardScreen.tsx:321). `fragile OK` appears only when true; mobile
  // prints nothing when false and a "no fragile" badge on every other card would
  // be noise.
  const secondary = [
    formatVehicle(trip.vehicle),
    trip.maxPackageSize ? `up to ${formatPackageSize(trip.maxPackageSize)}` : '',
    trip.acceptsFragile ? 'Fragile accepted' : '',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className="flex h-full flex-col rounded-card border border-[#eeebf1] bg-surface-raised p-6 shadow-card">
      {/* The route is the headline — it is what a sender scans for. */}
      <p className="font-display text-lg font-extrabold -tracking-[0.01em] text-[#17131c]">
        <span>{trip.originCity}</span>
        <span aria-hidden="true" className="mx-2 text-brand-600">
          →
        </span>
        <span>{trip.destinationCity}</span>
      </p>

      {when ? <p className="mt-2 text-sm text-[#5f5868]">{when}</p> : null}

      {secondary ? (
        <p className="mt-1 text-sm text-[#5f5868]">{secondary}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {chips.length > 0 ? (
          chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-surface-tint px-3 py-1 text-xs font-semibold text-[#17131c]"
            >
              {chip}
            </span>
          ))
        ) : (
          // Mobile lists only dimensions with room left, so a fully-booked trip
          // shows no chips at all. Saying so plainly beats an empty gap — and
          // the trip is NOT hidden, because the app does not hide it either.
          // #5f5868 (6.81:1 on white), NOT #8d8695 — that tone measures 3.51:1
          // at 12px and fails AA, the same failure Phases 1 and 9 swept out of
          // this codebase (see OperationalProof.jsx:189, HeroNetwork.jsx:101).
          // It matters most here: this sentence is the ONLY signal that a trip
          // is full, so it cannot be the least readable text on the card.
          <span className="text-xs text-[#5f5868]">No space remaining</span>
        )}
      </div>

      {/* ⚠️ TIER, NOT IDENTITY, AND NOT A CREDENTIAL.
          posterTier is derived server-side as driver?.activated ? 'driver' :
          'user'. It says only that the poster has an activated driver profile —
          it is not a verification, rating, or endorsement, and a user-posted
          trip is not inferior. Kept deliberately quiet at the card's foot for
          that reason. Do not restyle it as a badge, and do not relabel it
          "Verified"/"Professional". */}
      {/* #5f5868 for the same reason as the capacity line above: #8d8695 is
          3.51:1 at 12px on white. Keeping this line quiet is a job for size,
          weight and position — mt-auto parks it at the card's foot — never for
          dropping contrast below the floor. */}
      <p className="mt-auto pt-4 text-xs uppercase tracking-label text-[#5f5868]">
        Posted by {trip.posterTier === 'driver' ? 'a driver' : 'a user'}
      </p>
    </li>
  )
}
