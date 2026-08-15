'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { importMapsLibrary } from '@/lib/maps-loader'

// The DATA half of address autocomplete. Presentation is deliberately not here.
//
// ⚠️ WHY THIS EXISTS. /send used Google's <gmp-place-autocomplete> web component,
// which at viewports under ~640px switches itself into a FULL-SCREEN takeover:
// its own back arrow, its own search field, its own prediction list and Google
// Maps branding replace the booking page entirely. Measured on production with
// real browser input — the host collapses 48px -> 0px at 390 and 430, and stays
// 48px at 768 and 1440, so the trigger is viewport width and the behaviour is
// Google's, not ours. The dropdown lives in a CLOSED shadow root, so it cannot
// be styled, repositioned or suppressed from application code.
//
// The only way to keep a customer inside the Druppr booking flow on a phone is
// to own the input and the list ourselves and ask Google only for data. That is
// what this hook supplies.
//
// ⚠️ IT DOES NOT LOAD GOOGLE ON MOUNT. importMapsLibrary is called on the first
// real query, never at module scope or in a mount effect, so /send still issues
// ZERO Maps/Places requests until a customer actually types. Do not "warm" it.
//
// ── DUPLICATION NOTE ────────────────────────────────────────────────────────
// home/HeroAddressEntry.jsx contains an equivalent, older copy of this logic —
// it solved the same problem for the hero first. It is deliberately NOT
// refactored onto this hook in the same change that fixes a live booking
// defect; consolidating a working homepage island is a separate, lower-risk
// piece of work. If you touch either, prefer moving Hero onto this hook rather
// than letting the two drift further apart.

const MIN_QUERY_LENGTH = 3
const DEBOUNCE_MS = 250

// Canada only — the existing product restriction, copied from
// send/AddressAutocomplete.jsx and home/HeroAddressEntry.jsx rather than
// invented here. No approved GTA-only boundary exists, and restricting further
// would reject legitimate supported deliveries.
const REGION_CODES = ['ca']

// Google returns the split already; nothing is parsed out of a joined string.
export function splitPrediction(prediction) {
  const text = prediction?.text?.toString?.() ?? ''
  const main = prediction?.mainText?.toString?.() ?? text
  const secondary = prediction?.secondaryText?.toString?.() ?? ''
  return { main: main || text, secondary }
}

export function usePlacePredictions() {
  const [predictions, setPredictions] = useState([])
  // 'idle' | 'searching' | 'no-results' | 'failed'
  const [status, setStatus] = useState('idle')

  // Monotonic request id. A slow early request must never overwrite a fast late
  // one — type "100 K" then "100 King St" quickly and the first response can
  // land second. Every response re-checks that it is still the newest.
  const seqRef = useRef(0)
  const debounceRef = useRef(null)
  const mountedRef = useRef(true)
  const placesRef = useRef(null)

  // ⚠️ ONE TOKEN PER SEARCH SESSION, NOT PER KEYSTROKE AND NOT FOREVER.
  // Google bills an autocomplete session as "all the predictions leading to one
  // selection". Holding a token forever under-reports; minting one per keystroke
  // bills every character as its own session. It is created lazily on the first
  // query and cleared by endSession() once a place is committed.
  const tokenRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const ensurePlaces = useCallback(async () => {
    if (!placesRef.current) {
      placesRef.current = importMapsLibrary('places')
    }
    return placesRef.current
  }, [])

  const runSearch = useCallback(
    async (query) => {
      const seq = ++seqRef.current
      const fresh = () => mountedRef.current && seq === seqRef.current

      if (query.trim().length < MIN_QUERY_LENGTH) {
        // Below the threshold this is not "no results" — nothing was asked. A
        // "no matching addresses" message here would be a lie about a request
        // that never happened.
        if (fresh()) {
          setPredictions([])
          setStatus('idle')
        }
        return
      }

      setStatus('searching')

      try {
        const places = await ensurePlaces()
        if (!places || !fresh()) return

        if (!tokenRef.current) {
          tokenRef.current = new places.AutocompleteSessionToken()
        }

        const { suggestions } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            includedRegionCodes: REGION_CODES,
            sessionToken: tokenRef.current,
          })

        if (!fresh()) return

        const next = (suggestions ?? [])
          .map((entry) => entry.placePrediction)
          .filter(Boolean)

        setPredictions(next)
        setStatus(next.length ? 'idle' : 'no-results')
      } catch {
        if (!fresh()) return
        // Surfaced to the caller, never swallowed into an empty list that looks
        // like a legitimate "no addresses found".
        setPredictions([])
        setStatus('failed')
      }
    },
    [ensurePlaces],
  )

  const search = useCallback(
    (query) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => runSearch(query), DEBOUNCE_MS)
    },
    [runSearch],
  )

  const reset = useCallback(() => {
    seqRef.current += 1 // invalidate anything in flight
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setPredictions([])
    setStatus('idle')
  }, [])

  // Call after a place has been committed: that session is finished and the next
  // search must bill as a new one.
  const endSession = useCallback(() => {
    tokenRef.current = null
  }, [])

  return { predictions, status, search, reset, endSession, minLength: MIN_QUERY_LENGTH }
}
