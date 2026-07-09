import Image from 'next/image'

import { LiveTracking } from './LiveTracking'

const API_BASE_URL =
  'https://seal-app-9hhnm.ondigitalocean.app/api/public/track'

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

function InfoList({ title, items }) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <div className="mt-4 space-y-3 text-sm text-slate-700">
        {items.map(({ key, label, value }) => (
          <div key={key ?? label} className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {label}
            </span>
            <span className="mt-1 font-medium text-slate-700">
              {value || '--'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

async function getTrackingDetails(trackingCode) {
  try {
    const response = await fetch(`${API_BASE_URL}/${trackingCode}`, {
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
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-rose-100 bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-semibold text-slate-900">
            Tracking unavailable
          </h1>
          <p className="mt-4 text-sm text-slate-600">
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
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-purple-700 text-lg font-semibold text-white">
            L
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Order Tracking
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">
              Track your delivery
            </h1>
          </div>
        </header>

        <LiveTracking
          trackingCode={code ?? trackingCode}
          initialStatus={status}
          initialMessage={message}
          initialDriverLocation={driverLocation}
          initialEta={eta}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoList title="Order Details" items={orderItems} />

            {driver ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-500">
                  Your Driver
                </h3>
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-white">
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
                      <div className="flex h-full w-full items-center justify-center bg-purple-700 text-lg font-semibold text-white">
                        {driverInitial}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {driver.firstName || 'Your driver'}
                      <span className="font-normal text-slate-500">
                        {' '}
                        is your driver
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {titleCase(driver.vehicleType)}
                    </p>
                    <p className="mt-1 text-sm font-medium text-amber-600">
                      <span role="img" aria-hidden>
                        ★
                      </span>{' '}
                      {Number(driver.overAllRating ?? 0).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </LiveTracking>
      </div>
    </main>
  )
}
