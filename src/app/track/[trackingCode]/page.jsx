import { API_BASE_URL } from '@/lib/config'
import { getDriverPresentation } from '@/lib/tracking-presentation.mjs'
import {
  CompletionMarker,
  InfoList,
  TrackingHeader,
} from '@/components/track/TrackingChrome'
import { TrackingDriverSummary } from '@/components/track/TrackingPresentation'

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
                : 'We couldn’t find tracking details for this code. Please double-check it or contact the sender for assistance.'}
            </p>
          </section>
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

  const driverPresentation = driver
    ? getDriverPresentation({
        firstName: driver.firstName,
        photoUrl: driver.photoUrl,
        vehicleType: driver.vehicleType,
        rating: driver.overAllRating,
      })
    : null

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
    <main className="min-h-screen bg-surface-page px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6">
        <TrackingHeader eyebrow="Order tracking" title="Track your delivery" />

        <LiveTracking
          trackingCode={code ?? trackingCode}
          initialStatus={status}
          initialMessage={message}
          initialDriverLocation={driverLocation}
          initialEta={eta}
          driverSummary={
            driverPresentation ? (
              <TrackingDriverSummary driver={driverPresentation} />
            ) : null
          }
          deliveryDetails={
            <InfoList
              title="Delivery details"
              items={orderItems}
              footer={status === 'delivered' ? <CompletionMarker /> : null}
            />
          }
        />
      </div>
    </main>
  )
}
