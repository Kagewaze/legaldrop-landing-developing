'use client'

import Link from 'next/link'
import { useState } from 'react'

import { AddressAutocomplete } from '@/components/send/AddressAutocomplete'
import { formatMoney } from '@/components/send/PriceBreakdown'
import { SendMap } from '@/components/send/SendMap'
import { useDropBatchQuote } from '@/components/send/useDropBatchQuote'
import { DROPBATCH_VEHICLES } from '@/components/send/vehicles'
import { DROPBATCH_PUBLIC_QUOTE_ENABLED } from '@/lib/config'
import {
  DELIVERY_TIME_ZONE,
  isFutureInstant,
  torontoFieldsToIso,
  torontoTodayIso,
} from '@/lib/toronto-time'

const FIELD =
  'min-h-11 w-full rounded-control border border-[#d9d2df] bg-white px-4 py-3 text-base text-[#17131c] focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20'

export function DropBatchRequestFlow() {
  const [pickup, setPickup] = useState(null)
  const [dropoff, setDropoff] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [vehicle, setVehicle] = useState('car')
  const [packageCount, setPackageCount] = useState(1)
  const [quoteInput, setQuoteInput] = useState(null)
  const [requestKey, setRequestKey] = useState(0)
  const [error, setError] = useState('')

  const result = useDropBatchQuote(quoteInput, {
    enabled: DROPBATCH_PUBLIC_QUOTE_ENABLED,
  })

  function invalidate(change) {
    change()
    setQuoteInput(null)
    setError('')
  }

  function submit(event) {
    event.preventDefault()
    const scheduledPickupAt = torontoFieldsToIso(date, time)

    if (!pickup || !dropoff) {
      setError('Choose both a pickup and drop-off address.')
      return
    }
    if (!scheduledPickupAt || !isFutureInstant(scheduledPickupAt)) {
      setError('Choose a scheduled pickup time in the future.')
      return
    }
    if (!Number.isInteger(packageCount) || packageCount < 1) {
      setError('Enter at least one package.')
      return
    }

    setError('')
    setRequestKey((value) => value + 1)
    setQuoteInput({
      pickup,
      dropoff,
      pickupTiming: 'scheduled',
      scheduledPickupAt,
      vehicle,
      packageCount,
      requestKey: requestKey + 1,
    })
  }

  const quote = result.quote
  const matches = result.matches
  const belowMinimum = result.status === 'ready' && quote?.eligible === false
  const noMatches = result.status === 'ready' && quote?.eligible === true && matches.length === 0

  return (
    <div className="bg-[#fbf9fc] text-[#17131c]">
      <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 sm:py-16">
        <p className="text-sm font-extrabold uppercase tracking-label text-brand-700">DropBatch</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.02em] sm:text-5xl">
          Check long-distance availability
        </h1>
        <p className="mt-4 max-w-[65ch] text-base leading-7 text-[#5f5868] sm:text-lg">
          Enter a future scheduled route. Druppr will check for compatible active trips and return an authoritative DropBatch price when one is available.
        </p>

        <form onSubmit={submit} noValidate className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <section aria-labelledby="route-step" className="rounded-card border border-[#ebe6ef] bg-white p-5 sm:p-7">
              <p className="text-xs font-extrabold text-brand-700">STEP 1</p>
              <h2 id="route-step" className="mt-1 text-2xl font-extrabold">Route</h2>
              <div className="mt-5 space-y-3">
                <AddressAutocomplete label="Pickup address" variant="pickup" selected={pickup} onSelect={(place) => invalidate(() => setPickup(place))} onClear={() => invalidate(() => setPickup(null))} />
                <AddressAutocomplete label="Drop-off address" variant="dropoff" selected={dropoff} onSelect={(place) => invalidate(() => setDropoff(place))} onClear={() => invalidate(() => setDropoff(null))} />
              </div>
              <div className="mt-5 min-h-[260px] overflow-hidden rounded-control bg-[#f4f0f6]">
                <SendMap pickup={pickup} dropoff={dropoff} />
              </div>
            </section>

            <section aria-labelledby="schedule-step" className="rounded-card border border-[#ebe6ef] bg-white p-5 sm:p-7">
              <p className="text-xs font-extrabold text-brand-700">STEP 2</p>
              <h2 id="schedule-step" className="mt-1 text-2xl font-extrabold">Schedule</h2>
              <p className="mt-2 text-sm text-[#5f5868]">DropBatch requires a future scheduled pickup. ASAP is not available.</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-sm font-bold">Pickup date</span>
                  <input className={FIELD} type="date" min={torontoTodayIso()} value={date} onChange={(event) => invalidate(() => setDate(event.target.value))} required />
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-bold">Pickup time</span>
                  <input className={FIELD} type="time" value={time} onChange={(event) => invalidate(() => setTime(event.target.value))} required />
                </label>
              </div>
              <p className="mt-2 text-xs text-[#5f5868]">Times are interpreted in {DELIVERY_TIME_ZONE.split('/')[1].replace('_', ' ')} time.</p>
            </section>

            <section aria-labelledby="package-step" className="rounded-card border border-[#ebe6ef] bg-white p-5 sm:p-7">
              <p className="text-xs font-extrabold text-brand-700">STEP 3</p>
              <h2 id="package-step" className="mt-1 text-2xl font-extrabold">Package</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-sm font-bold">Package count</span>
                  <input className={FIELD} type="number" min="1" max="100" step="1" value={packageCount} onChange={(event) => invalidate(() => setPackageCount(Number(event.target.value)))} required />
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-bold">Requested vehicle</span>
                  <select className={FIELD} value={vehicle} onChange={(event) => invalidate(() => setVehicle(event.target.value))}>
                    {DROPBATCH_VEHICLES.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                  </select>
                </label>
              </div>
              <input type="hidden" name="mode" value="package" />
            </section>

            {error && <p id="dropbatch-request-error" role="alert" className="rounded-control bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

            <button type="submit" className="min-h-11 w-full rounded-control bg-brand-600 px-6 py-4 text-base font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 hover:bg-brand-700 sm:w-auto">
              Check availability
            </button>
          </div>

          <aside aria-labelledby="quote-result-heading" aria-live="polite" className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-[#ebe6ef] bg-white p-5 shadow-sm sm:p-7">
              <p className="text-xs font-extrabold text-brand-700">STEP 4</p>
              <h2 id="quote-result-heading" className="mt-1 text-2xl font-extrabold">Availability and quote</h2>
              {!quoteInput && <p className="mt-4 leading-7 text-[#5f5868]">Complete the route, schedule and package details to check availability.</p>}
              {result.status === 'loading' && <p className="mt-4 leading-7 text-[#5f5868]">Checking compatible trips and authoritative pricing…</p>}
              {result.status === 'unavailable' && (
                <div className="mt-5" role="alert">
                  <p className="font-bold">We could not check DropBatch right now.</p>
                  <p className="mt-2 text-sm leading-6 text-[#5f5868]">Your details are still here. Retry without changing your route.</p>
                  <button type="button" onClick={submit} className="mt-4 min-h-11 rounded-control border border-[#d9d2df] px-5 py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700">Retry</button>
                </div>
              )}
              {belowMinimum && (
                <div className="mt-5">
                  <p className="text-xl font-extrabold">DropBatch is designed for longer deliveries.</p>
                  <p className="mt-2 leading-7 text-[#5f5868]">Your route is below the {quote.minimumKm ?? 80} km DropBatch minimum.</p>
                  <StandardDeliveryLink />
                </div>
              )}
              {noMatches && (
                <div className="mt-5">
                  <p className="text-xl font-extrabold">No compatible trip right now</p>
                  <p className="mt-2 leading-7 text-[#5f5868]">No compatible DropBatch trip is available for this route and schedule right now. Adjust your inputs or use standard delivery.</p>
                  <StandardDeliveryLink />
                </div>
              )}
              {result.show && (
                <div className="mt-5">
                  <p className="text-sm font-bold text-[#5f5868]">Your DropBatch price</p>
                  <p className="mt-1 text-4xl font-extrabold">{formatMoney(result.senderPays)}</p>
                  {Number.isFinite(Number(quote?.routeDistanceKm)) && <p className="mt-3 text-sm text-[#5f5868]">Route distance: {Number(quote.routeDistanceKm).toFixed(1)} km</p>}
                  <p className="mt-2 text-sm text-[#5f5868]">{result.matchCount} compatible {result.matchCount === 1 ? 'trip' : 'trips'} found{result.soonestWindow?.date ? ` · earliest departure ${result.soonestWindow.date}` : ''}.</p>
                  {result.allOverCapacity && <p className="mt-4 rounded-control bg-amber-50 p-4 text-sm leading-6 text-amber-900">The posted remaining capacity may not accommodate this request. This result is not immediately usable.</p>}
                  <p className="mt-5 border-t border-[#ebe6ef] pt-4 text-sm leading-6 text-[#5f5868]">Availability depends on a compatible active trip. DropBatch online booking is being prepared; this quote does not reserve or book a delivery.</p>
                  <StandardDeliveryLink />
                </div>
              )}
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}

function StandardDeliveryLink() {
  return <Link href="/send" className="mt-5 inline-flex min-h-11 items-center rounded-control bg-[#17131c] px-5 py-3 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17131c]">Book a standard delivery</Link>
}
