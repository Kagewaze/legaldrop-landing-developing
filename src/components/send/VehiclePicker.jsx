'use client'

import { VEHICLES } from '@/components/send/vehicles'
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

export function VehiclePicker({ selected, onSelect, quotes, status }) {
  return (
    <div className="flex flex-col gap-2.5">
      {VEHICLES.map((vehicle) => {
        const isSelected = vehicle.id === selected
        const quote = quotes[vehicle.id]

        return (
          <button
            key={vehicle.id}
            type="button"
            onClick={() => onSelect(vehicle.id)}
            aria-pressed={isSelected}
            className={`flex items-center gap-4 rounded-2xl border-[1.5px] px-4 py-4 text-left transition-colors ${
              isSelected
                ? 'border-brand-600 bg-[#faf5fe] shadow-[0_0_0_3px_rgba(123,47,190,0.12)]'
                : 'border-[#eeebf1] bg-white hover:bg-[#faf7fd]'
            }`}
          >
            <span
              className={`flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[13px] ${
                isSelected ? 'bg-brand-600' : 'bg-[#f3ebfb]'
              }`}
            >
              <span
                className={`block ${vehicle.glyph} ${
                  isSelected ? 'bg-white' : 'bg-brand-600'
                }`}
              />
            </span>

            <span className="flex-1">
              <span className="block text-[16px] font-bold text-[#17131c]">
                {vehicle.name}
              </span>
              <span className="mt-0.5 block text-[13px] text-[#5f5868]">
                {vehicle.description}
              </span>
            </span>

            <span className="text-[17px] font-extrabold tracking-[-0.01em] text-[#17131c]">
              {quote ? (
                formatMoney(quote.total)
              ) : status === 'loading' ? (
                <span className="text-[13px] font-semibold text-[#8d8695]">
                  …
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
