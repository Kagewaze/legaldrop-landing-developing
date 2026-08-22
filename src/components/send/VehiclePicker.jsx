'use client'

import { VEHICLES, packageCapacityRefusal } from '@/components/send/vehicles'
import { formatMoney } from '@/components/send/PriceBreakdown'

// Vehicle selector with per-vehicle pricing.
//
// The design shows a static "base price" beside each vehicle and an ETA
// ("8 min", "6 min"). Neither is ported:
//   - the price shown here is the real quoted TOTAL for that vehicle, from
//     quote-itemized, not a hardcoded base;
//   - the ETA is dropped entirely. There is no ETA in the quote response, and
//     inventing a pickup time is the same class of fabrication as the duration
//     dropped from step 1.

// Bike is refused above 10 km. VERIFIED against the live backend rather than
// assumed: quote-itemized returns 201 at 9.993 km and a bare 500 at 10.024 km,
// with car succeeding at 23.6 km on the same coordinates — so the refusal is
// specific to bike and the boundary is exactly 10.0, not approximately.
//
// The backend sends no reason with the 500, so this is the frontend's
// inference. It is only stated when the trip distance is actually known and
// actually over the cap; anything else falls back to the neutral wording, so a
// transient server fault can never be reported to the customer as a distance
// limit.
const BIKE_MAX_KM = 10

function unavailableReason(vehicleId, distanceKm) {
  if (
    vehicleId === 'bike' &&
    Number.isFinite(distanceKm) &&
    distanceKm > BIKE_MAX_KM
  ) {
    return `Not available over ${BIKE_MAX_KM} km`
  }

  return 'Not available for this trip'
}

export function VehiclePicker({
  selected,
  onSelect,
  quotes,
  unavailable = {},
  distanceKm = null,
  status,
  packageCount = 1,
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {VEHICLES.map((vehicle) => {
        // Capacity is known LOCALLY and with certainty — we have the package
        // count in hand — so it is stated outright rather than inferred from a
        // server refusal the way the bike's distance cap has to be. It is also
        // resolved before `status`, so an over-capacity car reads "Up to 5
        // packages" immediately instead of spinning on a request that is never
        // sent.
        const overCapacity = packageCapacityRefusal(vehicle.id, packageCount)
        const isSelected = !overCapacity && vehicle.id === selected
        const quote = overCapacity ? null : quotes[vehicle.id]
        const isUnavailable = !quote && Boolean(unavailable[vehicle.id])

        // The card STAYS, disabled, rather than being filtered out of the list.
        // Removing the row would shift every card below it upward at the exact
        // moment the customer pressed "+", moving the next option under a
        // cursor already travelling toward it — and it would delete the only
        // place we can explain why the cheapest vehicle just vanished. Disabled
        // keeps the list a fixed height, so no gap opens and nothing overlaps.
        return (
          <button
            key={vehicle.id}
            type="button"
            onClick={() => onSelect(vehicle.id)}
            disabled={Boolean(overCapacity)}
            aria-pressed={isSelected}
            className={`flex items-center gap-4 rounded-2xl border-[1.5px] px-4 py-4 text-left transition-colors ${
              overCapacity
                ? 'cursor-not-allowed border-[#f2f0f4] bg-[#fbfafc]'
                : isSelected
                  ? 'border-brand-600 bg-[#faf5fe] shadow-[0_0_0_3px_rgba(123,47,190,0.12)]'
                  : 'border-[#eeebf1] bg-white hover:bg-[#faf7fd]'
            }`}
          >
            <span
              className={`flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[13px] ${
                overCapacity
                  ? 'bg-[#f4f2f6]'
                  : isSelected
                    ? 'bg-brand-600'
                    : 'bg-[#f3ebfb]'
              }`}
            >
              <span
                className={`block ${vehicle.glyph} ${
                  overCapacity
                    ? 'bg-[#c9c3d0]'
                    : isSelected
                      ? 'bg-white'
                      : 'bg-brand-600'
                }`}
              />
            </span>

            <span className="flex-1">
              <span
                className={`block text-[16px] font-bold ${
                  overCapacity ? 'text-[#9b93a5]' : 'text-[#17131c]'
                }`}
              >
                {vehicle.name}
              </span>
              <span
                className={`mt-0.5 block text-[13px] ${
                  overCapacity ? 'text-[#a49dad]' : 'text-[#5f5868]'
                }`}
              >
                {vehicle.description}
              </span>
            </span>

            {/* A bare "—" used to stand for every one of these cases, which
                told a customer whose trip was too long for a bike nothing at
                all — and left them retrying a dead end. */}
            <span className="text-right text-[17px] font-extrabold tracking-[-0.01em] text-[#17131c]">
              {overCapacity ? (
                <span className="block max-w-[104px] text-[12px] font-semibold leading-tight text-[#8d8695]">
                  {overCapacity}
                </span>
              ) : quote ? (
                formatMoney(quote.total)
              ) : status === 'loading' ? (
                <span className="text-[13px] font-semibold text-[#8d8695]">
                  …
                </span>
              ) : isUnavailable ? (
                <span className="block max-w-[104px] text-[12px] font-semibold leading-tight text-[#8d8695]">
                  {unavailableReason(vehicle.id, distanceKm)}
                </span>
              ) : (
                <span className="text-[13px] font-semibold text-[#8d8695]">
                  —
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
