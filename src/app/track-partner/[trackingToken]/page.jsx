import { API_BASE_URL } from '@/lib/config'
import { partnerTrackingIdentity, trackingPollUrl } from '@/lib/tracking.mjs'
import { getDriverPresentation } from '@/lib/tracking-presentation.mjs'
import {
  CompletionMarker,
  InfoList,
  TrackingHeader,
} from '@/components/track/TrackingChrome'
import { TrackingDriverSummary } from '@/components/track/TrackingPresentation'

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
    const response = await fetch(
      trackingPollUrl(TRACK_PARTNER_ENDPOINT, trackingToken),
      {
        cache: 'no-store',
      },
    )

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
      <main className="min-h-screen bg-surface-page px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
          <TrackingHeader eyebrow="Order tracking" title="Track your delivery" />
          <section className="rounded-card border border-[#eeebf1] bg-surface-raised p-8 text-center shadow-card sm:p-10">
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-[#17131c]">
              Tracking unavailable
            </h2>
            <p className="mt-4 text-[15px] text-[#5f5868]">
              {trackingError
                ? trackingError
                : 'We couldn’t find tracking details for this link. Please double-check it or contact the sender for assistance.'}
            </p>
          </section>
        </div>
      </main>
    )
  }

  // The route token is the credential for every partner request, server-side
  // and client-side alike. `displayCode` is the short human-readable reference
  // and is used only for rendering — see partnerTrackingIdentity for the bug
  // that a `trackingCode ?? trackingToken` fallback caused here.
  const { pollCredential, displayCode } = partnerTrackingIdentity({
    routeTrackingToken: trackingToken,
    payload: tracking,
  })

  const {
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

  const driverPresentation = driver
    ? getDriverPresentation({
        firstName: driver.firstName,
        photoUrl: driver.photoUrl,
        vehicleType: driver.vehicleType,
        rating: driver.overAllRating,
      })
    : null

  const receiverList = Array.isArray(receivers) ? receivers : []

  const routeSummaryItems = [
    // Never the token: it is a credential, not a label.
    { key: 'tracking-code', label: 'Tracking Code', value: displayCode ?? '--' },
    {
      key: 'stops',
      label: 'Delivery Stops',
      value: `${receiverList.length} ${receiverList.length === 1 ? 'stop' : 'stops'}`,
    },
    route?.distanceInKm != null
      ? {
          key: 'distance',
          label: 'Route Distance',
          value: `${Number(route.distanceInKm).toFixed(1)} km`,
        }
      : null,
  ].filter(Boolean)

  const deliveryItems = [
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

  const senderItems = [
    { key: 'sender-name', label: 'Sender', value: senderName },
    { key: 'sender-address', label: 'Pickup Address', value: senderAddress },
  ].filter((item) => item.value)

  return (
    <main className="min-h-screen bg-surface-page px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6">
        <TrackingHeader eyebrow="Order tracking" title="Track your delivery" />

        <PartnerLiveTracking
          trackingToken={pollCredential}
          initialStatus={status}
          initialMessage={message}
          initialDriverLocation={driverLocation}
          initialEta={eta}
          initialSenderLocation={senderLocation}
          initialReceivers={receiverList}
          initialRoute={route}
          driverSummary={
            driverPresentation ? (
              <TrackingDriverSummary driver={driverPresentation} />
            ) : null
          }
          routeSummary={
            <InfoList title="Route summary" items={routeSummaryItems} />
          }
          pickupDetails={
            senderItems.length > 0 ? (
              <InfoList title="Pickup" items={senderItems} />
            ) : null
          }
          destinationsDetails={
            receiverList.length > 0 ? (
              <section className="rounded-card border border-[#eeebf1] bg-surface-raised p-6 shadow-card">
                <h2 className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
                  Destinations
                </h2>
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
                        <span className="text-[11px] font-semibold uppercase tracking-label text-[#8d8695]">
                          Stop {index + 1}
                        </span>
                        {receiver?.receiverName ? (
                          <span className="mt-1 text-[15px] font-semibold text-[#17131c]">
                            {receiver.receiverName}
                          </span>
                        ) : null}
                        <span className="text-[13px] text-[#5f5868]">
                          {receiver?.receiverAddress || '--'}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null
          }
          deliveryDetails={
            <InfoList
              title="Delivery details"
              items={deliveryItems}
              footer={status === 'delivered' ? <CompletionMarker /> : null}
            />
          }
        />
      </div>
    </main>
  )
}
