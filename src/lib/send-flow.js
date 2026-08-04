'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  SEND_FLOW_STORAGE_KEY,
  hasBothAddresses,
  isPlace,
} from '@/lib/send-flow-contract'

// Send-flow state, shared across /send and /send/details.
//
// Persisted to sessionStorage so a refresh mid-flow does not throw away the
// addresses someone just typed. Same reasoning as the guest session: one
// booking, one tab — it survives refresh and dies when the tab closes.

// PHASE 7: the literal moved to src/lib/send-flow-contract.js so the homepage
// address form can write this key without importing this module — which would
// have pulled SendFlowProvider's context onto a page that must not mount it.
// Aliased rather than renamed so every existing reference below is untouched.
const STORAGE_KEY = SEND_FLOW_STORAGE_KEY

const EMPTY_STATE = {
  pickup: null, // { address, lat, lng }
  dropoff: null, // { address, lat, lng }
  packageCount: 1,
  weight: 'light',
  vehicle: 'car',
  // Consignment type. 'other' is the general consumer default and the value the
  // flow sent unconditionally before presets existed; a ?section= param on step
  // 1 can substitute one of the other whitelisted values.
  //
  // NOT part of paymentInputsHash, deliberately — the backend prices every
  // section identically, so including it would invalidate live recovery records
  // for a change that cannot move the fare.
  section: 'other',
  // The backend requires all of these on POST /order. The design collects none
  // of them, so they are gathered on the payment step.
  contact: {
    senderName: '',
    senderPhone: '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
  },
}

// POST /order needs a name and phone for both ends, and at least one of
// receiverPhone / receiverEmail. Phone is collected for the recipient, so the
// email is genuinely optional.
export function contactIsComplete(contact) {
  if (!contact) {
    return false
  }

  const filled = (value) => typeof value === 'string' && value.trim().length > 0

  return (
    filled(contact.senderName) &&
    filled(contact.senderPhone) &&
    filled(contact.receiverName) &&
    (filled(contact.receiverPhone) || filled(contact.receiverEmail))
  )
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

// ── Payment recovery ────────────────────────────────────────────────────────
//
// Deliberately a SEPARATE storage key from the flow state above, and
// deliberately not part of the React context.
//
// It has to outlive things the flow state does not. It is written
// synchronously, immediately before confirmPayment is called, so that a crash,
// a closed laptop or a refresh mid-payment leaves a record that the next mount
// can find. If it lived in the context it would be subject to React's render
// timing; if it shared the flow's key it would be destroyed by the same clear
// that runs on success.
//
// THE INVARIANT: a stored record means "a PaymentIntent exists and NO order has
// been created for it yet". It is cleared in exactly one place — after
// POST /order succeeds. That is what makes "stored record + intent already
// succeeded" an unambiguous signal that the customer paid and we still owe them
// an order.
const PAYMENT_STORAGE_KEY = 'legaldrop.send-payment.v1'

// Identifies the priced inputs. If any of these change, a PaymentIntent created
// for the old ones is for the wrong amount and must not be reused.
export function paymentInputsHash(state) {
  return [
    state?.pickup?.lat,
    state?.pickup?.lng,
    state?.dropoff?.lat,
    state?.dropoff?.lng,
    state?.vehicle,
    state?.packageCount,
    state?.weight,
  ].join('|')
}

export function readPaymentSession() {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return null
  }

  try {
    const raw = sessionStorage.getItem(PAYMENT_STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)

    if (
      typeof parsed?.paymentIntentId !== 'string' ||
      typeof parsed?.clientSecret !== 'string'
    ) {
      return null
    }

    return parsed
  } catch (error) {
    return null
  }
}

export function writePaymentSession(session) {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return
  }

  try {
    sessionStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(session))
  } catch (error) {
    // Storage unavailable. The payment can still proceed; only crash-recovery
    // is lost. Not a reason to block someone from paying.
  }
}

// The ONLY place this is called is after POST /order succeeds. Do not add
// another caller — clearing it early loses the record that the customer paid.
export function clearPaymentSession() {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return
  }

  try {
    sessionStorage.removeItem(PAYMENT_STORAGE_KEY)
  } catch (error) {
    // Nothing useful to do.
  }
}

// PHASE 7: isPlace and hasBothAddresses moved to send-flow-contract.js, which
// has no React in it. Re-exported here so every existing importer of
// `hasBothAddresses` from this module keeps working unchanged — /send,
// /send/details and /send/pay all import it from here.
export { hasBothAddresses }

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
      // Merged rather than replaced, so a record written before the contact
      // fields existed (or a partial one) still yields every key.
      contact: { ...EMPTY_STATE.contact, ...(parsed?.contact ?? {}) },
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
  const setSection = useCallback(
    (section) => setState((prev) => ({ ...prev, section })),
    [],
  )
  const setContactField = useCallback(
    (field, value) =>
      setState((prev) => ({
        ...prev,
        contact: { ...prev.contact, [field]: value },
      })),
    [],
  )
  // Called once the order exists, so a second booking starts clean rather than
  // inheriting the previous trip's addresses and contact details.
  const resetFlow = useCallback(() => setState(EMPTY_STATE), [])

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      setPickup,
      setDropoff,
      setPackageCount,
      setWeight,
      setVehicle,
      setSection,
      setContactField,
      resetFlow,
    }),
    [
      state,
      hydrated,
      setPickup,
      setDropoff,
      setPackageCount,
      setWeight,
      setVehicle,
      setSection,
      setContactField,
      resetFlow,
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
