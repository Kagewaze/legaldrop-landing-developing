'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

// Send-flow state, shared across /send and /send/details.
//
// Persisted to sessionStorage so a refresh mid-flow does not throw away the
// addresses someone just typed. Same reasoning as the guest session: one
// booking, one tab — it survives refresh and dies when the tab closes.

const STORAGE_KEY = 'legaldrop.send-flow.v1'

const EMPTY_STATE = {
  pickup: null, // { address, lat, lng }
  dropoff: null, // { address, lat, lng }
  packageCount: 1,
  weight: 'light',
  vehicle: 'car',
}

export const PACKAGE_COUNT_MIN = 1
export const PACKAGE_COUNT_MAX = 12

// Weight bands, as in the design.
//
// ⚠️ UNVERIFIED: `kg` is what we send to the backend as receivers[].weight, and
// the backend uses it to compute lineItems.heavyFee. The design only specifies
// bands ("Under 15 kg"), not the number to transmit, so these are representative
// midpoints. Confirm against how the backend actually tiers heavyFee before
// launch — if it expects a band identifier rather than a number, or tiers at
// different thresholds, the surcharge shown will be wrong.
//
// The design's own $4 / $9 surcharges are placeholders and are NOT used
// anywhere: the fee displayed always comes from lineItems.heavyFee.
export const WEIGHT_OPTIONS = [
  { id: 'light', label: 'Under 15 kg', kg: 10 },
  { id: 'mid', label: '15–30 kg', kg: 25 },
  { id: 'heavy', label: 'Over 30 kg', kg: 40 },
]

export function weightKgFor(weightId) {
  const option = WEIGHT_OPTIONS.find((entry) => entry.id === weightId)
  return (option ?? WEIGHT_OPTIONS[0]).kg
}

function isPlace(value) {
  return (
    value &&
    typeof value.address === 'string' &&
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng)
  )
}

// Both endpoints of the journey are known. Every downstream step depends on
// this, so it lives here rather than being re-derived per page.
export function hasBothAddresses(state) {
  return isPlace(state?.pickup) && isPlace(state?.dropoff)
}

function readStored() {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return null
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)

    return {
      ...EMPTY_STATE,
      ...parsed,
      // Coordinates are the only thing here that can silently corrupt a quote,
      // so re-validate rather than trusting whatever is in storage.
      pickup: isPlace(parsed?.pickup) ? parsed.pickup : null,
      dropoff: isPlace(parsed?.dropoff) ? parsed.dropoff : null,
    }
  } catch (error) {
    return null
  }
}

const SendFlowContext = createContext(null)

export function SendFlowProvider({ children }) {
  const [state, setState] = useState(EMPTY_STATE)

  // Storage cannot be read during render (it does not exist on the server), so
  // the first client render always shows EMPTY_STATE. `hydrated` tells the step
  // guards to wait — without it, /send/details would redirect to /send on its
  // very first frame, before the saved addresses have been restored.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readStored()

    if (stored) {
      setState(stored)
    }

    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      // Private mode or quota. The flow still works for this page's lifetime;
      // only refresh-survival is lost.
    }
  }, [state, hydrated])

  const setPickup = useCallback(
    (place) => setState((prev) => ({ ...prev, pickup: place })),
    [],
  )
  const setDropoff = useCallback(
    (place) => setState((prev) => ({ ...prev, dropoff: place })),
    [],
  )
  const setPackageCount = useCallback(
    (count) =>
      setState((prev) => ({
        ...prev,
        packageCount: Math.min(
          PACKAGE_COUNT_MAX,
          Math.max(PACKAGE_COUNT_MIN, count),
        ),
      })),
    [],
  )
  const setWeight = useCallback(
    (weight) => setState((prev) => ({ ...prev, weight })),
    [],
  )
  const setVehicle = useCallback(
    (vehicle) => setState((prev) => ({ ...prev, vehicle })),
    [],
  )

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      setPickup,
      setDropoff,
      setPackageCount,
      setWeight,
      setVehicle,
    }),
    [
      state,
      hydrated,
      setPickup,
      setDropoff,
      setPackageCount,
      setWeight,
      setVehicle,
    ],
  )

  return (
    <SendFlowContext.Provider value={value}>
      {children}
    </SendFlowContext.Provider>
  )
}

export function useSendFlow() {
  const context = useContext(SendFlowContext)

  if (!context) {
    throw new Error('useSendFlow must be used inside SendFlowProvider')
  }

  return context
}
