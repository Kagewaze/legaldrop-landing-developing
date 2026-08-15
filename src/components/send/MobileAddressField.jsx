'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'

import {
  splitPrediction,
  usePlacePredictions,
} from '@/lib/use-place-predictions'

// The phone-width address field for /send Step 1.
//
// ⚠️ THIS EXISTS BECAUSE GOOGLE'S WIDGET HIJACKS THE PAGE ON PHONES.
// <gmp-place-autocomplete> switches into a full-screen takeover below ~640px —
// its own back arrow, search bar, list and Google Maps branding replace the
// booking flow entirely, and it is all inside a CLOSED shadow root, so it can be
// neither styled nor suppressed. Proven on production with real browser input:
// the host collapses 48px -> 0px at 390 and 430 and stays 48px at 768 and 1440.
//
// So below sm we own the input and the list, and Google supplies only data.
//
// ⚠️ THIS COMPONENT NEVER RESOLVES A PLACE ITSELF. It hands the chosen
// prediction back through onCommit, which is the SAME commitPrediction the
// desktop widget calls — toPlace() -> fetchFields(['location','formattedAddress'])
// -> onSelect({ address, lat, lng }). One resolve path, so the parent contract
// cannot drift between phone and desktop. Do not add a second fetchFields here.
export function MobileAddressField({
  label,
  placeholder,
  value,
  selected,
  onQueryChange,
  onCommit,
  onInvalidate,
  commitStatus,
}) {
  const { predictions, status, search, reset, endSession, minLength } =
    usePlacePredictions()

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef(null)
  const blurTimer = useRef(null)
  const rawId = useId()
  const listId = `${rawId}-listbox`

  useEffect(
    () => () => {
      if (blurTimer.current) clearTimeout(blurTimer.current)
    },
    [],
  )

  const handleChange = useCallback(
    (event) => {
      const next = event.target.value
      onQueryChange(next)

      // ⚠️ TYPING INVALIDATES A PREVIOUS SELECTION. Editing the text after
      // choosing an address must not leave Step 1 holding the OLD coordinates
      // while showing new text — that would quote and dispatch to the wrong
      // place. The parent decides what invalidation means; this only reports it.
      if (selected) {
        onInvalidate()
      }

      setActiveIndex(-1)
      setOpen(true)
      search(next)
    },
    [onQueryChange, onInvalidate, search, selected],
  )

  const choose = useCallback(
    (prediction) => {
      if (!prediction) return
      setOpen(false)
      setActiveIndex(-1)
      reset()
      // The session ends at selection; the next search bills as a new one.
      endSession()
      onCommit(prediction)
    },
    [onCommit, reset, endSession],
  )

  const handleKeyDown = useCallback(
    (event) => {
      if (!open || predictions.length === 0) {
        if (event.key === 'Escape') setOpen(false)
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((i) => (i + 1) % predictions.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((i) => (i <= 0 ? predictions.length - 1 : i - 1))
      } else if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault()
        choose(predictions[activeIndex])
      } else if (event.key === 'Escape') {
        setOpen(false)
      }
    },
    [open, predictions, activeIndex, choose],
  )

  const showList = open && (predictions.length > 0 || status === 'no-results')

  return (
    <div className="relative">
      {/* ⚠️ NO VISIBLE <label> HERE. AddressAutocomplete already renders an
          sr-only label for this row and the placeholder carries the meaning
          visually — adding one made "Pickup address" appear above a field that
          never had a visible caption. aria-label supplies the accessible name
          without changing the design. */}
      <input
        id={rawId}
        ref={inputRef}
        type="text"
        aria-label={label}
        // Google's own autofill would compete with the prediction list.
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${rawId}-opt-${activeIndex}` : undefined
        }
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={() => {
          if (value.trim().length >= minLength) setOpen(true)
        }}
        onBlur={() => {
          // A tap on a row fires blur BEFORE click. Closing immediately would
          // dismiss the list under the finger and swallow the selection. The
          // rows also preventDefault on pointerdown, so this delay is a second
          // guard rather than the only one.
          blurTimer.current = setTimeout(() => setOpen(false), 150)
        }}
        onKeyDown={handleKeyDown}
        // ⚠️ text-base is 16px and is LOAD-BEARING, not a style choice. iOS
        // Safari zooms the whole viewport when a focused input is under 16px.
        className="min-h-12 w-full rounded-control border-[1.5px] border-[#e3dfe8] bg-white px-4 py-3 text-base text-[#17131c] placeholder:text-[#5f5868] focus:border-brand-600 focus:outline-none"
      />

      {commitStatus === 'pending' ? (
        <p className="mt-1.5 text-sm text-[#5f5868]">Getting the address…</p>
      ) : null}

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${label} suggestions`}
          // In normal flow, not absolutely positioned: the booking card is
          // `overflow-hidden`, so an absolute list would be clipped by it. Letting
          // the card grow avoids fighting that with z-index or overflow hacks and
          // keeps the page scrollable while the list is open.
          className="mt-2 overflow-hidden rounded-control border border-[#eeebf1] bg-white shadow-card"
        >
          {predictions.map((prediction, index) => {
            const { main, secondary } = splitPrediction(prediction)
            return (
              <li key={`${main}-${index}`} className="border-b border-[#f4f1f7] last:border-b-0">
                <button
                  type="button"
                  id={`${rawId}-opt-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  // Keeps the input from blurring before the tap resolves.
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => choose(prediction)}
                  className={`flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left ${
                    index === activeIndex ? 'bg-surface-tint' : 'bg-white'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 h-2 w-2 flex-none rounded-full bg-brand-600"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold text-[#17131c]">
                      {main}
                    </span>
                    {secondary ? (
                      <span className="block truncate text-[13px] text-[#5f5868]">
                        {secondary}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}

          {status === 'no-results' ? (
            <li className="px-4 py-3 text-[15px] text-[#5f5868]">
              No matching addresses found.
            </li>
          ) : null}

          {/* Required attribution for predictions rendered in our own UI. */}
          <li className="border-t border-[#f4f1f7] px-4 py-2 text-right text-[11px] text-[#8d8695]">
            Powered by Google
          </li>
        </ul>
      ) : null}
    </div>
  )
}
