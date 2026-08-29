import Image from 'next/image'

import {
  TRACKING_PROGRESS_STEPS,
  formatTrackingEta,
  getTrackingFooter,
  getTrackingStatusPresentation,
} from '@/lib/tracking-presentation.mjs'

import { statusPillClass } from './TrackingChrome'

function TrackingProgress({ progress }) {
  if (progress.kind === 'negative' || progress.kind === 'exceptional') {
    const negative = progress.kind === 'negative'
    return (
      <div
        className={`mt-6 rounded-[14px] px-4 py-3 text-left text-sm font-semibold ring-1 ring-inset ${
          negative
            ? 'bg-[#fdf0f1] text-[#96293a] ring-[#f2d2d7]'
            : 'bg-surface-tint text-brand-700 ring-[#e6dcf3]'
        }`}
        aria-label="Delivery progress"
      >
        {progress.label}
      </div>
    )
  }

  if (progress.kind !== 'normal') return null

  return (
    <ol className="mt-7 grid grid-cols-4" aria-label="Delivery progress">
      {TRACKING_PROGRESS_STEPS.map((step, index) => {
        const reached = index <= progress.currentIndex
        const complete = index < progress.currentIndex

        return (
          <li key={step.status} className="relative flex flex-col items-center">
            {index > 0 ? (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-[6px] h-0.5 w-full ${
                  reached ? 'bg-brand-600' : 'bg-[#ddd7e3]'
                }`}
              />
            ) : null}
            <span
              aria-hidden="true"
              className={`relative z-10 h-3.5 w-3.5 rounded-full ring-4 ring-white ${
                reached ? 'bg-brand-600' : 'bg-[#c8c1ce]'
              }`}
            />
            <span
              className={`mt-3 text-center text-[11px] font-semibold ${
                reached ? 'text-[#17131c]' : 'text-[#8d8695]'
              }`}
            >
              {step.label}
              {complete ? <span className="sr-only"> complete</span> : null}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function TrackingLiveStatus({ status, message, eta }) {
  const presentation = getTrackingStatusPresentation({ status, message })
  const etaText = formatTrackingEta(eta)

  return (
    <section className="rounded-card border border-[#eeebf1] bg-surface-raised p-8 text-center shadow-card">
      <span
        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-label ring-1 ring-inset ${statusPillClass(
          status,
        )}`}
      >
        {presentation.statusLabel}
      </span>
      <h2 className="mt-5 font-display text-2xl font-extrabold tracking-[-0.02em] text-[#17131c]">
        {presentation.headline}
      </h2>
      {etaText ? (
        <p className="mt-2 text-base font-semibold text-brand-700">{etaText}</p>
      ) : null}

      <TrackingProgress progress={presentation.progress} />

      <div className="mt-6 rounded-[14px] bg-surface-tint px-4 py-3 text-left ring-1 ring-inset ring-[#e6dcf3]">
        <p className="text-[11px] font-semibold uppercase tracking-label text-brand-700">
          Current update
        </p>
        <p className="mt-1.5 text-[15px] leading-6 text-[#403947]">
          {presentation.instruction}
        </p>
      </div>
    </section>
  )
}

export function TrackingDriverSummary({ driver, className = '' }) {
  if (!driver) return null

  return (
    <section
      className={`rounded-card border border-[#eeebf1] bg-surface-raised p-6 shadow-card ${className}`}
    >
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
              {driver.initial}
            </div>
          )}
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[#17131c]">{driver.name}</p>
          {driver.vehicleLabel ? (
            <p className="mt-0.5 text-[13px] text-[#5f5868]">
              {driver.vehicleLabel}
            </p>
          ) : null}
          {driver.ratingLabel ? (
            <p className="mt-1.5 text-[13px] font-semibold text-[#5f5868]">
              <span aria-hidden="true" className="text-brand-600">
                ★
              </span>{' '}
              {driver.ratingLabel}
              <span className="sr-only"> out of 5 driver rating</span>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function TrackingLiveFooter({ status }) {
  return (
    <footer className="pt-2 text-center text-[13px] text-[#5f5868]">
      {getTrackingFooter(status)}
    </footer>
  )
}
