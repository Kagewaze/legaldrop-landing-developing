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
        className={`mt-6 rounded-[14px] border-l-4 px-4 py-3.5 text-left text-sm font-semibold ring-1 ring-inset ${
          negative
            ? 'border-l-[#b33a4d] bg-[#fdf0f1] text-[#96293a] ring-[#f2d2d7]'
            : 'border-l-brand-600 bg-[#f5edfa] text-brand-700 ring-[#ddcbea]'
        }`}
        aria-label="Delivery progress"
      >
        {progress.label}
      </div>
    )
  }

  if (progress.kind !== 'normal') return null

  return (
    <ol className="mt-7 grid grid-cols-4 px-1" aria-label="Delivery progress">
      {TRACKING_PROGRESS_STEPS.map((step, index) => {
        const reached = index <= progress.currentIndex
        const complete = index < progress.currentIndex

        return (
          <li key={step.status} className="relative flex flex-col items-center">
            {index > 0 ? (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-[7px] h-[3px] w-full ${
                  reached ? 'bg-brand-600' : 'bg-[#e2d7e9]'
                }`}
              />
            ) : null}
            <span
              aria-hidden="true"
              className={`relative z-10 h-4 w-4 rounded-full border-2 border-white ${
                reached
                  ? 'bg-brand-600 shadow-[0_0_0_4px_rgba(123,47,190,0.13)]'
                  : 'bg-[#c9bdcf] shadow-[0_0_0_4px_rgba(226,215,233,0.55)]'
              }`}
            />
            <span
              className={`mt-3 px-0.5 text-center text-[10px] font-bold leading-4 sm:text-[11px] ${
                reached ? 'text-[#34213f]' : 'text-[#887a90]'
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
    <section className="relative overflow-hidden rounded-card border border-[#dfcfea] bg-[linear-gradient(145deg,#ffffff_0%,#fdfaff_68%,#f5ebfa_100%)] p-6 text-center shadow-[0_1px_2px_rgba(82,28,130,0.05),0_12px_30px_-18px_rgba(82,28,130,0.36)] sm:p-8">
      <span
        aria-hidden="true"
        className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl"
      />
      <span
        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-label ring-1 ring-inset ${statusPillClass(
          status,
        )}`}
      >
        {presentation.statusLabel}
      </span>
      <h2 className="relative mt-5 font-display text-2xl font-extrabold tracking-[-0.02em] text-[#281632] sm:text-3xl">
        {presentation.headline}
      </h2>
      {etaText ? (
        <p className="mt-2 text-base font-semibold text-brand-700">{etaText}</p>
      ) : null}

      <TrackingProgress progress={presentation.progress} />

      <div className="relative mt-6 rounded-[14px] border-l-4 border-l-brand-600 bg-[#f3eafa] px-4 py-3.5 text-left ring-1 ring-inset ring-[#ddcbea]">
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
      className={`relative overflow-hidden rounded-card border border-[#dfcfea] bg-[linear-gradient(135deg,#ffffff_0%,#fbf7fd_100%)] p-6 shadow-[0_1px_2px_rgba(82,28,130,0.04),0_9px_24px_-18px_rgba(82,28,130,0.32)] ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-brand-600"
      />
      <h2 className="text-xs font-bold uppercase tracking-label text-brand-700">
        Your driver
      </h2>
      <div className="mt-5 flex items-center gap-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white bg-surface-raised shadow-[0_0_0_3px_rgba(123,47,190,0.16)]">
          {driver.photoUrl ? (
            <Image
              src={driver.photoUrl}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-600 text-base font-bold text-white">
              {driver.initial}
            </div>
          )}
        </div>
        <div>
          <p className="text-base font-bold text-[#281632]">{driver.name}</p>
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
