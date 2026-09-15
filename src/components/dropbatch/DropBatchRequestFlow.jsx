'use client'

import { MarketingLink as Link } from '@/components/MarketingNavigation'
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
  const [pickupTiming, setPickupTiming] = useState('instant')
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
    const scheduledPickupAt =
      pickupTiming === 'scheduled' ? torontoFieldsToIso(date, time) : null

    if (!pickup || !dropoff) {
      setError('Choose both a pickup and drop-off address.')
      return
    }
    if (
      pickupTiming === 'scheduled' &&
      (!scheduledPickupAt || !isFutureInstant(scheduledPickupAt))
    ) {
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
      pickupTiming,
      scheduledPickupAt,
      vehicle,
      packageCount,
      requestKey: requestKey + 1,
    })
  }

  const quote = result.quote
  const unavailable = result.status === 'ready' && quote?.eligible === false

  return (
    <div data-booking-route="/drop-batch/request" className="bg-[#fbf9fc] text-[#17131c]">
      <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 sm:py-16">
        <p className="text-sm font-extrabold uppercase tracking-label text-brand-700">DropBatch</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.02em] sm:text-5xl">
          Get your DropBatch price
        </h1>
        <p className="mt-4 max-w-[65ch] text-base leading-7 text-[#5f5868] sm:text-lg">
          Enter your route and choose ASAP or a preferred pickup time. Druppr will return the authoritative flexible-delivery price.
        </p>

        <form onSubmit={submit} noValidate className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <section aria-labelledby="route-step" className="rounded-card border border-[#ebe6ef] bg-white p-5 sm:p-7">
              <p className="text-xs font-extrabold text-brand-700">STEP 1</p>
              <h2 id="route-step" className="mt-1 text-2xl font-extrabold">Route</h2>
              <div className="mt-5 grid grid-cols-1 gap-5">
                <AddressAutocomplete label="Pickup location" variant="pickup" selected={pickup} onSelect={(place) => invalidate(() => setPickup(place))} onClear={() => invalidate(() => setPickup(null))} homepageStyle />
                <AddressAutocomplete label="Drop-off location" variant="dropoff" selected={dropoff} onSelect={(place) => invalidate(() => setDropoff(place))} onClear={() => invalidate(() => setDropoff(null))} homepageStyle />
              </div>
              <div className="mt-5 min-h-[260px] overflow-hidden rounded-control bg-[#f4f0f6]">
                <SendMap pickup={pickup} dropoff={dropoff} />
              </div>
            </section>

            <section aria-labelledby="schedule-step" className="rounded-card border border-[#ebe6ef] bg-white p-5 sm:p-7">
              <p className="text-xs font-extrabold text-brand-700">STEP 2</p>
              <h2 id="schedule-step" className="mt-1 text-2xl font-extrabold">Pickup timing</h2>
              <fieldset className="mt-5">
                <legend className="sr-only">Pickup timing</legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className={`cursor-pointer rounded-control border p-4 ${pickupTiming === 'instant' ? 'border-brand-600 ring-2 ring-brand-100' : 'border-[#d9d2df]'}`}>
                    <input
                      type="radio"
                      name="pickup-timing"
                      value="instant"
                      checked={pickupTiming === 'instant'}
                      onChange={() => invalidate(() => setPickupTiming('instant'))}
                      className="mr-3 accent-brand-600"
                    />
                    <span className="font-bold">As soon as a suitable driver accepts</span>
                  </label>
                  <label className={`cursor-pointer rounded-control border p-4 ${pickupTiming === 'scheduled' ? 'border-brand-600 ring-2 ring-brand-100' : 'border-[#d9d2df]'}`}>
                    <input
                      type="radio"
                      name="pickup-timing"
                      value="scheduled"
                      checked={pickupTiming === 'scheduled'}
                      onChange={() => invalidate(() => setPickupTiming('scheduled'))}
                      className="mr-3 accent-brand-600"
                    />
                    <span className="font-bold">Schedule for later</span>
                  </label>
                </div>
              </fieldset>
              {pickupTiming === 'scheduled' && (
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
              )}
              {pickupTiming === 'scheduled' ? (
                <p className="mt-2 text-xs text-[#5f5868]">Times are interpreted in {DELIVERY_TIME_ZONE.split('/')[1].replace('_', ' ')} time.</p>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[#5f5868]">Your delivery will be posted to eligible Druppr drivers immediately after booking. Acceptance may be quick when the route fits, or may take longer while drivers look for deliveries heading in the same direction.</p>
              )}
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
              Get my DropBatch price
            </button>
          </div>

          <aside data-booking-surface aria-labelledby="quote-result-heading" aria-live="polite" className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-[#ebe6ef] bg-white p-5 shadow-sm sm:p-7">
              <p className="text-xs font-extrabold text-brand-700">STEP 4</p>
              <h2 id="quote-result-heading" className="mt-1 text-2xl font-extrabold">DropBatch price</h2>
              {!quoteInput && <p className="mt-4 leading-7 text-[#5f5868]">Complete the route, pickup timing and package details to get your price.</p>}
              {result.status === 'loading' && <p className="mt-4 leading-7 text-[#5f5868]">Checking eligibility and authoritative pricing…</p>}
              {result.status === 'unavailable' && (
                <div className="mt-5" role="alert">
                  <p className="font-bold">We could not check DropBatch right now.</p>
                  <p className="mt-2 text-sm leading-6 text-[#5f5868]">Your details are still here. Retry without changing your route.</p>
                  <button type="button" onClick={submit} className="mt-4 min-h-11 rounded-control border border-[#d9d2df] px-5 py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700">Retry</button>
                </div>
              )}
              {unavailable && (
                <div className="mt-5">
                  <p className="text-xl font-extrabold">DropBatch is unavailable for these delivery details.</p>
                  <p className="mt-2 leading-7 text-[#5f5868]">Try another supported vehicle or use Standard Delivery.</p>
                  <StandardDeliveryLink />
                </div>
              )}
              {result.show && (
                <div className="mt-5">
                  <p className="text-sm font-bold text-[#5f5868]">Your DropBatch price</p>
                  <p data-booking-price key={result.senderPays} className="mt-1 text-4xl font-extrabold">{formatMoney(result.senderPays)}</p>
                  {Number.isFinite(Number(quote?.routeDistanceKm)) && <p className="mt-3 text-sm text-[#5f5868]">Route distance: {Number(quote.routeDistanceKm).toFixed(1)} km</p>}
                  <p className="mt-2 text-sm text-[#5f5868]">This is authoritative long-distance pricing. Your price does not depend on a driver already being assigned.</p>
                  <p className="mt-2 text-sm leading-6 text-[#5f5868]">{quoteInput.pickupTiming === 'scheduled' ? 'Eligible drivers can accept ahead of your preferred pickup time when the route fits.' : 'The delivery is posted immediately after booking; a suitable driver may accept quickly or acceptance may take longer.'}</p>
                  <p className="mt-5 border-t border-[#ebe6ef] pt-4 text-sm leading-6 text-[#5f5868]">Ready to book? Use Send a package to choose DropBatch as your delivery option. After booking, eligible Druppr drivers may accept quickly when the route fits, or acceptance may take longer while drivers look for deliveries heading in the same direction.</p>
                  <StandardDeliveryLink label="Send a package" />
                </div>
              )}
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}

function StandardDeliveryLink({ label = 'Book a standard delivery' }) {
  return <Link href="/send" className="mt-5 inline-flex min-h-11 items-center rounded-control bg-[#17131c] px-5 py-3 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17131c]">{label}</Link>
}
