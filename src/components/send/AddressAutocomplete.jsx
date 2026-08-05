'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { importMapsLibrary } from '@/lib/maps-loader'

// Google Places autocomplete input (Places API New: PlaceAutocompleteElement).
//
// ─── THIS ELEMENT IS UNCONTROLLED. DO NOT MAKE IT CONTROLLED. ───────────────
//
// The partner platform regressed here once. The rules, and why:
//
//  1. The ONLY event that commits a selection is 'gmp-select'. Do not listen to
//     'input' or 'change' for commit purposes — they fire on every keystroke,
//     when nothing has been selected and there are no coordinates yet.
//
//  2. Do not BIND element.value to React state. There is exactly ONE permitted
//     write: a single hydration write per mount, when the flow store already
//     holds an address from earlier in this tab — a refresh, or stepping back
//     from /send/details.
//
//     Why that write has to exist: without it the element renders empty while
//     the store says an address is set. The customer saw a committed-address
//     check, a "19.9 km trip" line, a live itemised fare and an enabled
//     Continue, with both fields blank — because hasBothAddresses() reads
//     state and the element's value was never restored. That let someone reach
//     the payment step on addresses they had not entered in that session.
//
//     What makes it safe, and what is still forbidden:
//       - it happens AT MOST ONCE per mount (hydratedRef), and never once the
//         customer has committed a selection of their own (userCommittedRef);
//       - so it can never echo a later state change back into the input, which
//         is the actual failure mode of a controlled element here;
//       - assigning .value fires NO input/change/gmp-select event (see rule 3),
//         so it cannot forge a commit or a quote request;
//       - it is wrapped in try/catch. If the setter is unsupported on the
//         pinned version the field simply stays empty — exactly the behaviour
//         before this write existed — rather than throwing into init's catch
//         and rendering the row as "Unavailable".
//
//     STILL FORBIDDEN, and this is the part not to misread: a useEffect that
//     writes .value whenever `selected` changes, a value= prop, or any other
//     ongoing sync. One latched write on mount is NOT a binding, and this
//     amendment is not permission to add one.
//
//  3. NEVER write a guard that compares the input's value against React state
//     to detect a "programmatic echo". Assigning .value fires NO input event,
//     so such a guard never fires in the case it was written for — and it DOES
//     fire on legitimate typing that happens to match state, silently dropping
//     a real user selection. It is wrong in both directions.
//
//     This is the partner platform's regression, commit 870fbe6, and it is a
//     DIFFERENT thing from the hydration write in rule 2. That guard ran on
//     every change and tried to INFER intent by comparing two values that are
//     legitimately equal much of the time. The hydration write infers nothing
//     and reads nothing back: it fires once, from a latch, at a moment we
//     choose. Comparison is what was wrong, not assignment.
//
//  4. The init effect has an empty dependency array on purpose. If it depended
//     on `value` or on the callback, the element would be torn down and rebuilt
//     mid-typing. The callback is reached through a ref instead.
//
//  5. There IS an 'input' listener, and it is not a commit path — rule 1 still
//     stands. It exists because Google ships its own clear button INSIDE the
//     closed shadow root (.input-container button.clear-button, 48x48, verified
//     in places.js). Pressing it empties the input and fires no 'gmp-select',
//     so without this listener the store would keep the address while the field
//     went blank — reopening the exact defect the mount hydration in rule 2 was
//     added to close, from the other direction.
//
//     Why an emptiness check is NOT the 870fbe6 guard. That guard asked "does
//     the input equal React state?" and tried to infer intent from the answer.
//     Two values that are legitimately equal much of the time cannot carry that
//     meaning, which is why it misfired in both directions. This listener never
//     compares the two. It asks one question of the input alone — "is it now
//     empty?" — and empty is unambiguous: it is never a valid committed
//     address. Our own writes cannot trigger it either, because assigning
//     .value fires no input event (rule 3), so the only thing that can empty
//     the field is the customer.
//
//     It listens for 'change' as well as 'input'. Whether Google's internal
//     clear dispatches either could not be verified through a closed shadow
//     root with a degraded key; both are composed:true, so if it emits one it
//     reaches us. If it emits neither, this desync survives and needs a device
//     check — it cannot cause a wrong order, only a stale one the customer can
//     still clear with our own button.
//
// React 18 does not bind props or events to custom elements, so the element is
// constructed imperatively and wired with addEventListener + cleanup.
//
// ─── STYLING CONTRACT ───────────────────────────────────────────────────────
//
// The shadow root is CLOSED (verified on the pinned 3.64). Consequences:
//   - descendant selectors and > can never reach the internal input;
//   - ::part() only works if Google tagged internals with part attributes,
//     which could not be verified;
//   - inherited properties and CSS custom properties do cross a closed
//     boundary, which is what the rules below are built on.
//
// ─── THE MATERIAL TOKENS DO NOT STYLE THIS ELEMENT ──────────────────────────
//
// Read before adding a colour here. Verified by reading the shipped stylesheet
// in maps-api-v3/api/js/64/14a/places.js at the pinned version:
//
//   - the autocomplete's own stylesheet references ZERO --gmp-mat-* tokens;
//   - it paints itself with 19 HARDCODED light-dark() literals, e.g.
//       :host      { background-color: light-dark(#fff,#131314) }
//       .dropdown  { background-color: light-dark(#fff,#131314) }
//   - the --gmp-mat-* family belongs to the Place Details / Place Search
//     widgets, which this app does not use.
//
// So the tokens kept below are inert for this input. They are retained only
// because they are real names at this version and cost nothing if Google ever
// wires them up. Four more were removed because they do not exist in 3.64 at
// all — surface-container-highest, surface-variant, outline and outline-variant
// (the real names are surface-container, outline-decorative, outline-
// interactive). Setting a colour token here and expecting the field to change
// is the mistake this note exists to prevent.
//
// ─── COLOR-SCHEME IS THE ACTUAL LEVER ───────────────────────────────────────
//
// Because the element declares `color-scheme: light dark` on its own :host and
// resolves every surface through light-dark(), a device in OS dark mode renders
// it near-black (#131314) — inside a white-and-purple site, mid-checkout. On
// mobile that is not a small dropdown: the element opens
// `.full-window-autocomplete-dialog` via showModal(), position:fixed inset:0,
// i.e. a FULL-SCREEN top-layer panel.
//
// `color-scheme: light` on the host fixes it, and is the only thing that can:
// color-scheme is inherited and light-dark() resolves from its USED VALUE, so
// it crosses the closed boundary where selectors cannot. Verified under an
// emulated dark OS against a faithful reproduction of Google's declarations —
// host, dropdown and the top-layer modal all flip from rgb(19,19,20) to white.
//
// Note the dialog is in the TOP LAYER, so it is NOT clipped by the
// overflow-hidden card in send/layout.jsx. It also means CSS cannot influence
// anything Google gates on a JS matchMedia('(prefers-color-scheme: dark)')
// check — that is how the MAP decides its theme, and this trick will not
// light-mode map tiles.
//
// Whether the tokens neutralise the internal input's own border could NOT be
// verified locally: the referrer-restricted key leaves the element degraded
// (it paints only the search icon, with no internal input at all).
//
// So this layout does not DEPEND on them. Our row draws no border of its own —
// the container around both rows is the only frame. If the tokens work, the
// field is chromeless inside our container. If they do not, Google's border is
// the ONLY border present, not a second one. Either way there is no box-in-box.
//
// Same reasoning for focus: the row's focus affordance is a background TINT,
// never a ring or border. A tint cannot stack with Google's own focus outline
// the way two borders would.

const THEME_STYLE_ID = 'dp-place-autocomplete-theme'

const THEME_CSS = `
.dp-place-field,
.dp-place-field gmp-place-autocomplete {
  /* THE LOAD-BEARING DECLARATION for dark-mode devices. See the styling
     contract above. Set on the wrapper as well as the host so the row and the
     input can never disagree about scheme. */
  color-scheme: light;
}

.dp-place-field gmp-place-autocomplete {
  /* INERT for this element — kept only because these are real token names at
     3.64. The autocomplete's stylesheet references none of them; see the
     styling contract above before adding another. */
  --gmp-mat-color-surface: transparent;
  --gmp-mat-color-on-surface: #17131c;
  --gmp-mat-color-on-surface-variant: #8d8695;
  --gmp-mat-color-primary: #7b2fbe;
  --gmp-mat-font-family: var(--font-inter), system-ui, sans-serif;

  /* Applied to the host itself, which we can always style. This is what
     actually sets the typeface — the token above does not. */
  display: block;
  background: transparent;
  border: 0;
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 16px;

  /* Google ships the host with an intrinsic width (~320px) that does not yield
     to flex shrinking, so the row overflowed its container and pushed the
     committed-address check outside the rounded box — badly at mobile widths.
     min-width:0 is the load-bearing declaration: without it, width/max-width
     are ignored because min-width wins over both. !important because these
     compete with Google's own injected stylesheet. */
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
}
`

// Injected once into <head> rather than rendered per instance, so two fields do
// not emit duplicate rules. Client-only, so there is no SSR/hydration concern.
function ensureThemeStyles() {
  if (typeof document === 'undefined') {
    return
  }

  if (document.getElementById(THEME_STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = THEME_STYLE_ID
  style.textContent = THEME_CSS
  document.head.append(style)
}

function RailGlyph({ variant }) {
  // The pickup dot and dropoff square, joined by a hairline that runs between
  // the two rows. Each row draws only its half of the line — from the glyph to
  // its own edge — so the join is height-agnostic and stays aligned however
  // tall the rows become.
  const isPickup = variant === 'pickup'

  return (
    <span
      aria-hidden
      className="relative flex w-3 flex-none items-center justify-center self-stretch"
    >
      <span
        className={`absolute left-1/2 w-px -translate-x-1/2 bg-[#e3dfe8] ${
          isPickup ? 'bottom-0 top-1/2' : 'bottom-1/2 top-0'
        }`}
      />
      <span
        className={
          isPickup
            ? 'relative z-10 h-[9px] w-[9px] rounded-full border-2 border-brand-600 bg-white'
            : 'relative z-10 h-[9px] w-[9px] bg-[#17131c]'
        }
      />
    </span>
  )
}

export function AddressAutocomplete({
  label,
  variant = 'pickup',
  selected,
  onSelect,
  onClear,
}) {
  const containerRef = useRef(null)

  // Latest props without re-running the init effect. See rule 4.
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const onClearRef = useRef(onClear)
  onClearRef.current = onClear
  const selectedRef = useRef(selected)
  selectedRef.current = selected

  // The constructed element. Held here because the hydration effect and the
  // clear button both need it, and both live outside the init effect that owns
  // its lifetime.
  const elementRef = useRef(null)

  // The rule-2 latch: at most one hydration write per mount, ever.
  const hydratedRef = useRef(false)

  // Set the moment the customer commits a real selection. From then on the
  // element holds text they chose, and hydration must never overwrite it —
  // formattedAddress and the string Google displays are not always identical.
  const userCommittedRef = useRef(false)

  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  // Whether a chosen suggestion is currently being turned into a real place.
  //
  // Selecting a suggestion is NOT the end of the story: the prediction has to
  // have its fields fetched, which is a second network round-trip. On mobile
  // data that is slow enough to look like nothing happened, and every failure
  // path used to be a bare return or a silent catch — so a tap could produce no
  // visible change at all. That is the most likely cause of the reported
  // "addresses don't propagate on mobile".
  const [commitStatus, setCommitStatus] = useState('idle') // 'idle'|'pending'|'failed'

  // The prediction behind a failed commit, kept so 'Try again' can retry the
  // fetch without making the customer search for the address a second time.
  const pendingPredictionRef = useRef(null)

  // Styling only — kept out of the init effect below so that effect stays
  // exactly what it was.
  useEffect(() => {
    ensureThemeStyles()
  }, [])

  // Turn a chosen prediction into a committed place. Split out of the event
  // handler so the retry button can re-run exactly the same path.
  const commitPrediction = useCallback(async (prediction) => {
    if (!prediction) {
      return
    }

    pendingPredictionRef.current = prediction
    setCommitStatus('pending')

    try {
      // Places API (New) hands back a prediction, not a place. It has to be
      // converted and then have its fields fetched explicitly.
      const place = prediction.toPlace()
      await place.fetchFields({ fields: ['location', 'formattedAddress'] })

      const location = place.location

      if (!location) {
        throw new Error('Place returned no location')
      }

      // lat/lng are FUNCTIONS on a LatLng, not properties. Reading them as
      // properties yields undefined and produces a quote request with no
      // coordinates.
      const lat = location.lat()
      const lng = location.lng()

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error('Place returned no usable coordinates')
      }

      // Set BEFORE the commit, so the re-render this triggers cannot reach the
      // hydration effect with the latch still open.
      userCommittedRef.current = true

      onSelectRef.current({
        address: place.formattedAddress ?? '',
        lat,
        lng,
      })

      pendingPredictionRef.current = null
      setCommitStatus('idle')
    } catch (error) {
      // Surfaced, never swallowed. The previous selection is left intact —
      // still better than committing a place with no coordinates — but the
      // customer now finds out, and can retry without re-searching.
      setCommitStatus('failed')
    }
  }, [])

  // Reached from inside the init effect, which must keep its empty deps.
  const commitPredictionRef = useRef(commitPrediction)
  commitPredictionRef.current = commitPrediction

  useEffect(() => {
    let cancelled = false
    let element = null
    let handleSelect = null
    let handleMaybeCleared = null

    async function init() {
      try {
        const { PlaceAutocompleteElement } = await importMapsLibrary('places')

        if (cancelled || !containerRef.current) {
          return
        }

        element = new PlaceAutocompleteElement({
          // Canada only — the service area is Toronto and the GTA.
          includedRegionCodes: ['ca'],
        })

        // Published for the hydration effect and the clear button. Assigned
        // before the status flip below, so by the time either of them can see
        // status === 'ready' the element is already reachable.
        elementRef.current = element

        // Visual only. The label is now visually hidden, so the placeholder is
        // what tells the customer which field this is. Support for this
        // property on 3.64 could not be verified locally (the element is
        // degraded without a valid referrer); assigning it is harmless if
        // unsupported, in which case Google's default placeholder shows.
        try {
          element.placeholder = label
        } catch (error) {
          // Read-only or unsupported — fall back to Google's default.
        }

        handleSelect = (event) => {
          commitPredictionRef.current(event?.placePrediction)
        }

        // Rule 5. NOT a commit path: this only ever reacts to the field
        // becoming EMPTY, which is the one input state that cannot be a valid
        // address. It exists to catch Google's own in-shadow clear button.
        handleMaybeCleared = () => {
          let current

          try {
            current = elementRef.current?.value ?? ''
          } catch (error) {
            return
          }

          if (current !== '' || !selectedRef.current) {
            return
          }

          pendingPredictionRef.current = null
          setCommitStatus('idle')
          onClearRef.current?.()
        }

        element.addEventListener('gmp-select', handleSelect)
        element.addEventListener('input', handleMaybeCleared)
        element.addEventListener('change', handleMaybeCleared)
        containerRef.current.appendChild(element)

        if (!cancelled) {
          setStatus('ready')
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    init()

    return () => {
      cancelled = true

      if (element && handleSelect) {
        element.removeEventListener('gmp-select', handleSelect)
      }

      if (element && handleMaybeCleared) {
        element.removeEventListener('input', handleMaybeCleared)
        element.removeEventListener('change', handleMaybeCleared)
      }

      element?.remove()
      elementRef.current = null
    }
    // Mount once. See rule 4 above. Adding `selected` here to drive hydration
    // is exactly the mistake rule 2 forbids — it would tear the element down
    // and rebuild it mid-typing. Hydration is a separate effect, below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Mount hydration — the one permitted .value write. See rule 2. ─────────
  //
  // Keyed on [selected, status] because the two things it needs arrive
  // independently, in an order that is NOT guaranteed: the element appears when
  // the Maps library resolves, and the address appears when SendFlowProvider
  // restores sessionStorage. React runs child effects before parent ones, so on
  // a cold mount `selected` is still null here — whichever of the two lands
  // second is what triggers the write.
  //
  // The latch, not the dependency list, is what keeps this to a single write.
  useEffect(() => {
    if (hydratedRef.current || userCommittedRef.current) {
      return
    }

    const element = elementRef.current

    if (!element || !selected?.address) {
      return
    }

    hydratedRef.current = true

    try {
      element.value = selected.address
    } catch (error) {
      // Setter unsupported on the pinned version. The field stays empty, which
      // is precisely the behaviour this write replaced — never a throw that
      // would leave the row reading "Unavailable".
    }
  }, [selected, status])

  // Drop the committed address and put the row back to an empty, typeable
  // state. Clearing the STORE is what actually matters: it is what turns
  // Continue back into a disabled button, so even if the .value clear below
  // fails there is no path to booking on an address the customer has dropped.
  function handleClear() {
    try {
      if (elementRef.current) {
        elementRef.current.value = ''
      }
    } catch (error) {
      // As above — the store clear below still runs.
    }

    // A dropped address cannot have a commit still pending against it.
    pendingPredictionRef.current = null
    setCommitStatus('idle')

    onClear?.()
  }

  return (
    <div>
      <div
        className={`dp-place-field flex min-h-[56px] items-stretch gap-3 px-4 transition-colors focus-within:bg-[#faf8fc] ${
          variant === 'pickup' ? 'rounded-t-2xl' : 'rounded-b-2xl'
        }`}
      >
        <RailGlyph variant={variant} />

        {/* min-w-0 is required on BOTH this flex item and the one below it.
          A flex item defaults to min-width:auto, i.e. it refuses to shrink
          below its content — so without it the Google element's intrinsic
          ~320px width pushes the committed-address check outside the rounded
          container (badly at mobile widths). */}
        <div
          className={`flex min-w-0 flex-1 items-center gap-3 ${
            variant === 'dropoff' ? 'border-t border-[#f0eef2]' : ''
          }`}
        >
          {/* Visually hidden, but still announced. The uppercase PICKUP/DROPOFF
            captions are gone; the placeholder carries that meaning visually. */}
          <span className="sr-only">{label}</span>

          <div ref={containerRef} className="min-w-0 flex-1" />

          {/* PHASE 9: #8d8695 -> #5f5868 (3.51:1 -> 6.81:1 on white). Colour
              only — no behaviour, no structure, nothing about the Google
              element's contract is touched.
              It is a transient indicator, but WCAG 1.4.3 has no exemption for
              short-lived text, and this ellipsis is the ONLY visual signal that
              the field is loading, so it is carrying information rather than
              decorating. The neighbouring "Unavailable" was measured in the
              same pass and left alone: rose-600 is 4.70:1, already over the
              4.5 floor at this size. */}
          {status === 'loading' && (
            <span className="flex-none text-[13px] text-[#5f5868]">…</span>
          )}

          {status === 'error' && (
            <span className="flex-none text-[13px] text-rose-600">
              Unavailable
            </span>
          )}

          {/* The missing feedback for the fetchFields round-trip. Compact enough
            to sit in a 215px-wide field on a 390px screen, and announced. */}
          {commitStatus === 'pending' && (
            <span className="flex-none" role="status">
              <span className="sr-only">Checking address…</span>
              <span
                aria-hidden
                className="block h-4 w-4 animate-spin rounded-full border-2 border-[#e3dfe8] border-t-brand-600"
              />
            </span>
          )}

          {/* This replaces the ✓ that used to sit here, and does its job as well
            as its own. That checkmark was aria-hidden, so the only confirmation
            an address had committed was invisible to assistive tech — and there
            was no way whatsoever to change an address once chosen, because
            nothing in the flow could set one back to null. A named button is
            both the confirmation and the way out.

            Gated on `selected` alone, deliberately NOT on status === 'ready':
            a stale address has to stay clearable when Maps is degraded, which
            is exactly the moment someone most needs to be rid of it. */}
          {selected && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={`Clear ${label.toLowerCase()}`}
              className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] leading-none text-brand-600 transition-colors hover:bg-[#f3ebfb] hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <span aria-hidden>✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Below the row rather than inside it: the row is already tight at
          mobile widths, and this needs room for a real explanation plus a
          retry. Previously this failure produced nothing at all on screen. */}
      {commitStatus === 'failed' && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-3 pl-[52px] text-[13px] text-rose-700"
        >
          <span>We couldn&rsquo;t finish adding that address.</span>
          <button
            type="button"
            onClick={() => commitPrediction(pendingPredictionRef.current)}
            className="font-bold text-brand-600 underline underline-offset-2 transition-colors hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
