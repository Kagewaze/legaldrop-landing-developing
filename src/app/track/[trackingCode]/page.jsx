import Image from 'next/image'

import { API_BASE_URL } from '@/lib/config'
import {
  CompletionMarker,
  InfoList,
  TrackingHeader,
  TrackingShell,
} from '@/components/track/TrackingChrome'

import { LiveTracking } from './LiveTracking'

const TRACK_ENDPOINT = `${API_BASE_URL}/public/track`

function formatDate(value) {
  if (!value) {
    return '--'
  }

  const timestamp = typeof value === 'number' ? value : Date.parse(value)

  if (Number.isNaN(timestamp)) {
    return value
  }

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function titleCase(value) {
  if (!value || typeof value !== 'string') {
    return value || '--'
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

// InfoList now lives in components/track/TrackingChrome.jsx — the partner route
// carried an identical copy, and the two had already drifted apart.

async function getTrackingDetails(trackingCode) {
  try {
    const response = await fetch(`${TRACK_ENDPOINT}/${trackingCode}`, {
      cache: 'no-store',
    })

    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const payload = isJson ? await response.json() : null

    if (!response.ok) {
      return {
        data: null,
        error:
          payload?.message ??
          'We were unable to fetch tracking details for this order.',
      }
    }

    if (!payload) {
      return {
        data: null,
        error: 'We received an unexpected response from the tracking service.',
      }
    }

    if (!payload?.success) {
      return {
        data: null,
        error: payload?.message ?? 'This tracking link is no longer available.',
      }
    }

    return {
      data: payload.data,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error:
        'Something went wrong while loading the tracking details. Please try again later.',
    }
  }
}

export default async function TrackOrderPage({ params }) {
  const { trackingCode } = params
  const { data: tracking, error: trackingError } =
    await getTrackingDetails(trackingCode)

  if (!tracking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-page px-5 py-16">
        <div className="w-full max-w-xl rounded-card border border-[#eeebf1] bg-surface-raised p-10 text-center shadow-card">
          <h1 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-[#17131c]">
            Tracking unavailable
          </h1>
          <p className="mt-4 text-[15px] text-[#5f5868]">
            {trackingError
              ? trackingError
              : 'We couldn’t find tracking details for this code. Please double-check it or contact the sender for assistance.'}
          </p>
        </div>
      </main>
    )
  }

  const {
    trackingCode: code,
    status,
    message,
    createdAt,
    onRouteToPickup,
    packagePickedUp,
    orderCategory,
    vehicle,
    driver,
    driverLocation,
    eta,
  } = tracking

  const driverInitial = driver?.firstName?.charAt(0)?.toUpperCase() ?? 'D'

  // The payload sends no rating for a driver who has not been rated, and the
  // previous `?? 0` turned that absence into a displayed 0.0. Treat only a
  // finite number above zero as a rating.
  const ratingValue = Number(driver?.overAllRating)
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0

  const orderItems = [
    { key: 'tracking-code', label: 'Tracking Code', value: code ?? trackingCode },
    { key: 'category', label: 'Category', value: titleCase(orderCategory) },
    { key: 'vehicle', label: 'Vehicle', value: titleCase(vehicle) },
    { key: 'created', label: 'Order Placed', value: formatDate(createdAt) },
    onRouteToPickup
      ? {
          key: 'on-route-pickup',
          label: 'On Route To Pickup',
          value: formatDate(onRouteToPickup),
        }
      : null,
    packagePickedUp
      ? {
          key: 'picked-up',
          label: 'Package Picked Up',
          value: formatDate(packagePickedUp),
        }
      : null,
  ].filter(Boolean)

  return (
    <TrackingShell>
        <TrackingHeader eyebrow="Order tracking" title="Track your delivery" />

        <LiveTracking
          trackingCode={code ?? trackingCode}
          initialStatus={status}
          initialMessage={message}
          initialDriverLocation={driverLocation}
          initialEta={eta}
        >
          <div className="grid items-start gap-5 sm:grid-cols-2">
            {/* The marker renders only for the real terminal delivered
                status, so the record card states its own outcome. */}
            <InfoList
              title="Order details"
              items={orderItems}
              footer={status === 'delivered' ? <CompletionMarker /> : null}
            />

            {driver ? (
              <section className="rounded-card border border-[#eeebf1] bg-surface-raised p-6 shadow-card">
                <h2 className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
                  Your driver
                </h2>
                <div className="mt-5 flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#eeebf1] bg-surface-raised">
                    {driver.photoUrl ? (
                      <Image
                        src={driver.photoUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-600 text-base font-bold text-white">
                        {driverInitial}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#17131c]">
                      {driver.firstName || 'Your driver'}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#5f5868]">
                      {titleCase(driver.vehicleType)}
                    </p>
                    {/* ⚠️ THIS USED TO READ `Number(rating ?? 0).toFixed(1)`,
                        which printed "0.0" for every driver the API returns no
                        rating for — an unrated driver was shown to the customer
                        as a zero-star driver. `0` is the absence of a rating in
                        this payload, not a score, so the row renders only when
                        the value is a real number above zero. Do not reinstate
                        a default. */}
                    {hasRating ? (
                      <p className="mt-1.5 text-[13px] font-semibold text-[#5f5868]">
                        <span aria-hidden="true" className="text-brand-600">
                          ★
                        </span>{' '}
                        {ratingValue.toFixed(1)}
                        <span className="sr-only"> out of 5 driver rating</span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </LiveTracking>
    </TrackingShell>
  )
}
