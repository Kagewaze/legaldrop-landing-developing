import Image from 'next/image'

import { API_BASE_URL } from '@/lib/config'
import {
  CompletionMarker,
  InfoList,
  TrackingHeader,
  TrackingShell,
} from '@/components/track/TrackingChrome'

import { PartnerLiveTracking } from './PartnerLiveTracking'

// Partner (full) tracking view. Consumes the backend's partner endpoint,
// which returns the sender, every receiver, and the route geometry — unlike
// the private /track/[trackingCode] view (driver-approaching-you only).
const TRACK_PARTNER_ENDPOINT = `${API_BASE_URL}/public/track-partner`

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

// InfoList now lives in components/track/TrackingChrome.jsx.

async function getPartnerTrackingDetails(trackingToken) {
  try {
    const response = await fetch(`${TRACK_PARTNER_ENDPOINT}/${trackingToken}`, {
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

export default async function TrackPartnerPage({ params }) {
  const { trackingToken } = params
  const { data: tracking, error: trackingError } =
    await getPartnerTrackingDetails(trackingToken)

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
              : 'We couldn’t find tracking details for this link. Please double-check it or contact the sender for assistance.'}
          </p>
        </div>
      </main>
    )
  }

  const {
    trackingCode,
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
    senderName,
    senderAddress,
    senderLocation,
    receivers,
    route,
  } = tracking

  const driverInitial = driver?.firstName?.charAt(0)?.toUpperCase() ?? 'D'

  // Same rating-presence rule as the public route (track/[trackingCode]/page.jsx
  // :136). `0` is the absence of a rating in this payload, not a score.
  const ratingValue = Number(driver?.overAllRating)
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0

  const receiverList = Array.isArray(receivers) ? receivers : []

  const orderItems = [
    { key: 'tracking-code', label: 'Tracking Code', value: trackingCode ?? trackingToken },
    { key: 'category', label: 'Category', value: titleCase(orderCategory) },
    { key: 'vehicle', label: 'Vehicle', value: titleCase(vehicle) },
    { key: 'created', label: 'Order Placed', value: formatDate(createdAt) },
    route?.distanceInKm != null
      ? {
          key: 'distance',
          label: 'Route Distance',
          value: `${Number(route.distanceInKm).toFixed(1)} km`,
        }
      : null,
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

  const senderItems = [
    { key: 'sender-name', label: 'Sender', value: senderName },
    { key: 'sender-address', label: 'Pickup Address', value: senderAddress },
  ].filter((item) => item.value)

  return (
    <TrackingShell>
        <TrackingHeader eyebrow="Order tracking" title="Track your delivery" />

        <PartnerLiveTracking
          trackingToken={trackingCode ?? trackingToken}
          initialStatus={status}
          initialMessage={message}
          initialDriverLocation={driverLocation}
          initialEta={eta}
          initialSenderLocation={senderLocation}
          initialReceivers={receiverList}
          initialRoute={route}
        >
          <div className="grid items-start gap-5 sm:grid-cols-2">
            {/* Same conditional completion marker as the public route. */}
            <InfoList
              title="Order Details"
              items={orderItems}
              footer={status === 'delivered' ? <CompletionMarker /> : null}
            />

            {senderItems.length > 0 ? (
              <InfoList title="Pickup" items={senderItems} />
            ) : null}

            {receiverList.length > 0 ? (
              <div className="rounded-card border border-[#eeebf1] bg-surface-raised p-6 shadow-card sm:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
                  Destinations
                </h3>
                <ol className="mt-5 space-y-4">
                  {receiverList.map((receiver, index) => (
                    <li
                      key={
                        receiver?.id ??
                        receiver?.receiverName ??
                        `receiver-${index}`
                      }
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[15px] font-semibold text-[#17131c]">
                          {receiver?.receiverName || `Stop ${index + 1}`}
                        </span>
                        <span className="text-[13px] text-[#5f5868]">
                          {receiver?.receiverAddress || '--'}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {driver ? (
              <div className="rounded-card border border-[#eeebf1] bg-surface-raised p-6 shadow-card sm:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
                  Your Driver
                </h3>
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#eeebf1] bg-surface-raised">
                    {driver.photoUrl ? (
                      <Image
                        src={driver.photoUrl}
                        alt={`${driver.firstName ?? 'Driver'} photo`}
                        fill
                        className="object-cover"
                        sizes="56px"
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
                    {/* ⚠️ THIS USED TO READ `Number(driver.overAllRating ?? 0)
                        .toFixed(1)`, which printed "0.0" for every driver the
                        API returns no rating for — showing a partner an unrated
                        driver as a zero-star driver. The public route fixed this
                        first; the partner route kept the legacy default until a
                        smoke test caught it. Do not reinstate a default. */}
                    {hasRating ? (
                      <p className="mt-1 text-sm font-medium text-amber-600">
                        <span role="img" aria-hidden>
                          ★
                        </span>{' '}
                        {ratingValue.toFixed(1)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </PartnerLiveTracking>
    </TrackingShell>
  )
}
