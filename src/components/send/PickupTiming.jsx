'use client'

import {
  DELIVERY_TIME_ZONE,
  formatTorontoInstant,
  isFutureInstant,
  torontoFieldsToIso,
  torontoTodayIso,
} from '@/lib/toronto-time'

// When the pickup should happen.
//
// ⚠️ WORDING IS BOUNDED BY WHAT THE BACKEND ACTUALLY DOES. A scheduled order becomes
// ELIGIBLE FOR DRIVER SEARCH at the chosen time — dispatch begins then, with no lead
// time and no guarantee about arrival. So this says "Scheduled pickup time" and
// "We start looking for a driver at this time". It must never say "guaranteed",
// "driver arrives at", or promise a window.
//
// ⚠️ TORONTO TIME, NOT THE BROWSER'S. The customer picks a wall-clock date and time
// in the delivery city; lib/toronto-time resolves it to one absolute instant using
// the real DST offset for that date. A customer booking from another timezone still
// schedules a Toronto pickup. The zone is stated on screen so that is not a surprise.

const RADIO =
  'flex-1 rounded-xl border-[1.5px] px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'

const FIELD =
  'w-full rounded-xl border-[1.5px] border-[#e3dfe8] bg-white px-4 py-3 text-base text-[#17131c] transition-colors focus:border-brand-600 focus:outline-none'

export function PickupTiming({
  pickupTiming,
  scheduledDate,
  scheduledTime,
  scheduledPickupAt,
  onTimingChange,
  onScheduleChange,
}) {
  const scheduled = pickupTiming === 'scheduled'

  // Both fields present but the instant is in the past — the backend would reject
  // it, so say so before the customer reaches payment.
  const hasBothFields = Boolean(scheduledDate && scheduledTime)
  const pastTime = hasBothFields && scheduledPickupAt && !isFutureInstant(scheduledPickupAt)
  const incomplete = scheduled && !hasBothFields

  const update = (nextDate, nextTime) => {
    onScheduleChange({
      date: nextDate,
      time: nextTime,
      // null until BOTH parts exist and parse. A half-filled form has no instant,
      // and guessing one is how a wrong pickup time gets sent.
      iso: torontoFieldsToIso(nextDate, nextTime),
    })
  }

  return (
    <fieldset>
      <legend className="mb-3 text-[13px] font-extrabold tracking-[0.08em] text-[#8d8695]">
        PICKUP TIME
      </legend>

      {/* Two mutually exclusive choices. Real radios rather than buttons so arrow
          keys move between them and screen readers announce the group. */}
      <div className="flex flex-col gap-3 sm:flex-row" role="radiogroup" aria-label="Pickup time">
        {[
          { id: 'instant', label: 'As soon as possible', hint: 'Dispatch starts once you pay' },
          { id: 'scheduled', label: 'Schedule for later', hint: 'Pick a date and time' },
        ].map((option) => {
          const active = pickupTiming === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onTimingChange(option.id)}
              className={`${RADIO} ${
                active
                  ? 'border-brand-600 bg-[#faf7fd]'
                  : 'border-[#e3dfe8] bg-white hover:border-[#17131c]'
              }`}
            >
              <span className="block text-[15px] font-bold text-[#17131c]">{option.label}</span>
              {/* Never colour alone: the label text carries the state too. */}
              <span className="mt-0.5 block text-[13px] text-[#5f5868]">{option.hint}</span>
            </button>
          )
        })}
      </div>

      {scheduled && (
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block" htmlFor="scheduledDate">
              <span className="mb-1.5 block text-[13px] font-bold text-[#17131c]">Date</span>
              <input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                // Toronto's today, not the browser's — booking from Vancouver at
                // 10pm must not offer a date Toronto has already passed.
                min={torontoTodayIso()}
                onChange={(event) => update(event.target.value, scheduledTime)}
                className={FIELD}
              />
            </label>

            <label className="block" htmlFor="scheduledTime">
              <span className="mb-1.5 block text-[13px] font-bold text-[#17131c]">Time</span>
              <input
                id="scheduledTime"
                type="time"
                value={scheduledTime}
                onChange={(event) => update(scheduledDate, event.target.value)}
                className={FIELD}
              />
            </label>
          </div>

          {/* aria-live so the resolved time, or the reason it is not accepted, is
              announced rather than only appearing. */}
          <p className="mt-2 text-[13px] text-[#5f5868]" aria-live="polite">
            {pastTime ? (
              <span className="font-semibold text-rose-700">
                Choose a time in the future.
              </span>
            ) : incomplete ? (
              'Choose both a date and a time.'
            ) : scheduledPickupAt ? (
              <>
                We start looking for a driver at{' '}
                <span className="font-semibold text-[#17131c]">
                  {formatTorontoInstant(scheduledPickupAt)}
                </span>
                .
              </>
            ) : (
              'Choose both a date and a time.'
            )}
          </p>

          <p className="mt-1 text-[12px] text-[#5f5868]">
            Times shown in Toronto time ({DELIVERY_TIME_ZONE.split('/')[1].replace('_', ' ')}).
          </p>
        </div>
      )}
    </fieldset>
  )
}

// Shared with the step that gates "Continue": a scheduled order needs a resolved,
// still-future instant. Exported so the page and the tests apply one rule.
export function pickupTimingIsComplete(flow) {
  if (flow?.pickupTiming !== 'scheduled') return true
  return Boolean(flow.scheduledPickupAt) && isFutureInstant(flow.scheduledPickupAt)
}
