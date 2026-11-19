'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ViaLink as Link } from '@/components/send/ViaLink'
import { bookingHrefWithVia } from '@/lib/via-navigation.mjs'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { API_BASE_URL } from '@/lib/config'
import {
  OrderIdentityUnavailableError,
  currentGuestUserId,
  referralCheckoutFetch,
  referralQuoteFetch,
  submitPaidOrder,
} from '@/lib/guest-session'
import {
  ORDER_SUBMISSION,
  OrderRefusedError,
  STORED_PAYMENT,
  bookingSummary,
  inspectStoredPayment,
  recoveryOrderBody,
} from '@/lib/paid-booking-recovery.mjs'
import {
  WEIGHT_OPTIONS,
  clearPaymentSession,
  contactIsComplete,
  hasBothAddresses,
  paymentInputsHash,
  readPaymentSession,
  useSendFlow,
  weightKgFor,
  writePaymentSession,
} from '@/lib/send-flow'
import { ContactFields } from '@/components/send/ContactFields'
import { PaymentForm } from '@/components/send/PaymentForm'
import { PriceBreakdown, formatMoney } from '@/components/send/PriceBreakdown'
import { normalizeCustomerQuote } from '@/lib/customer-quote.mjs'
import { buildOrderPayload } from '@/components/send/buildOrderPayload'
import {
  DROPBATCH_EXPLANATION,
  DROPBATCH_NO_PROMISE,
} from '@/lib/dropbatch-copy'
import {
  buildDropBatchQuoteRequest,
  dropBatchQuoteSignature,
  fetchDropBatchQuote,
} from '@/components/send/useDropBatchQuote'
import {
  apiKeyFor,
  packageCapacityRefusal,
  vehicleById,
} from '@/components/send/vehicles'

// Step 3 — payment. THIS CHARGES REAL CARDS ON LIVE STRIPE KEYS.
//
// Read the money-safety notes before changing anything here.
//
// The publishable key comes from GET /base/config, not an env var. Two sources
// of truth for which Stripe account is live is a payments hazard: a frontend
// env var pointing at one account while the backend mints intents on another
// fails at confirm time, in front of a paying customer.
//
// Copy deliberately NOT taken from the design, because it is factually wrong:
//   "Cards are charged when the driver collects" — false. POST /order requires
//     an ALREADY-PAID intent, so the charge happens strictly before the order
//     exists. Saying otherwise is a chargeback handed to the customer.
//   "You can cancel free until a driver accepts" — there is no cancel or refund
//     endpoint. Omitted rather than promised.
//   "Business accounts can switch to monthly invoicing" — partner-platform
//     billing, not consumer. Omitted.
//   No HST/tax line — prices are tax-inclusive and the API returns no tax
//     field. The total is the total.

// loadStripe must not run per render. Cached against the key so a key change
// (test → live) still produces a fresh instance.
let stripePromiseCache = null
let stripeKeyCache = null

function getStripePromise(publishableKey) {
  if (!stripePromiseCache || stripeKeyCache !== publishableKey) {
    stripeKeyCache = publishableKey
    stripePromiseCache = loadStripe(publishableKey)
  }

  return stripePromiseCache
}

const ELEMENTS_APPEARANCE = {
  variables: {
    colorPrimary: '#7B2FBE',
    colorText: '#17131c',
    colorDanger: '#e11d48',
    borderRadius: '12px',
    fontSizeBase: '15px',
  },
}

// R-M1: names a booking by its addresses (and schedule), from a bookingSummary.
function BookingLine({ summary, centered = false }) {
  if (!summary) {
    return null
  }

  return (
    <div className={`mt-2 text-[15px] text-[#17131c] ${centered ? 'text-center' : ''}`}>
      {summary.pickupAddress} → {summary.dropoffAddress}
      {summary.scheduledPickupAt && (
        <span className="block text-[13px] text-[#5f5868]">
          Scheduled pickup: {new Date(summary.scheduledPickupAt).toLocaleString()}
        </span>
      )}
    </div>
  )
}

// R-M1: on any unresolved-payment screen, say when it concerns an EARLIER
// booking than the one the customer is entering now.
function EarlierBookingNote({ booking }) {
  if (!booking?.earlier) {
    return null
  }

  return (
    <div className="mt-4 rounded-2xl bg-[#fff8e6] p-4 text-[14px] text-[#5f5868]">
      <div className="font-bold text-[#17131c]">
        This is about an earlier booking from this tab
      </div>
      {booking.summary ? (
        <BookingLine summary={booking.summary} />
      ) : (
        <p className="mt-1">Its details aren&rsquo;t shown on this device.</p>
      )}
      <p className="mt-1">
        The booking you&rsquo;re entering now is kept and isn&rsquo;t affected.
      </p>
    </div>
  )
}

export default function SendPayPage() {
  const router = useRouter()
  const flow = useSendFlow()

  // booting | ready | recovering | placing | done | orderFailed | priceMismatch | error
  const [phase, setPhase] = useState('booting')
  const [publishableKey, setPublishableKey] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [quote, setQuote] = useState(null)
  const [fee, setFee] = useState(null)
  const [referralAdjustment, setReferralAdjustment] = useState(0)
  const [trackingCode, setTrackingCode] = useState(null)
  const [failureMessage, setFailureMessage] = useState(null)
  const [retrying, setRetrying] = useState(false)

  // R-M1. The booking a paid-but-unfinished record describes, and whether it
  // is an EARLIER booking than the one now in the form (different inputs).
  // `summary` is addresses, pricing mode and schedule only (bookingSummary),
  // and is null when the stored guest is not the record's owner.
  const [pendingBooking, setPendingBooking] = useState(null)
  // The booking an order was just created for — what the success screens name.
  const [completedBooking, setCompletedBooking] = useState(null)
  // Same-tick guard for "Finish my earlier booking" (no second submission).
  const finishingEarlierRef = useRef(false)

  // get-fee is in flight. Disables the confirm button so it cannot double-fire
  // and mint two PaymentIntents for one delivery.
  const [feePending, setFeePending] = useState(false)
  // Shown inline under the confirm button. Distinct from `failureMessage`,
  // which takes over the whole page — a rejected get-fee has charged nobody and
  // is worth retrying in place.
  const [confirmError, setConfirmError] = useState(null)

  // The intent currently in play. Held in a ref as well as storage so the
  // recovery UI can show it without re-reading sessionStorage.
  const paymentIntentIdRef = useRef(null)

  // Boot no longer creates anything chargeable — get-fee moved behind the
  // confirm button below. The guard stays because the boot sequence is still
  // two network round-trips that should not run twice under StrictMode.
  const bootedRef = useRef(false)

  const inputsHash = paymentInputsHash(flow)

  // ── Order creation ────────────────────────────────────────────────────────
  //
  // Called only ever AFTER the card has been charged. Its failure mode is the
  // worst one in the flow (paid, no order), so it is isolated and retryable
  // with the SAME intent — never by paying again.
  //
  // Sent as the guest that created the checkout (submitPaidOrder): never a
  // newly minted one, which the backend would refuse as a stranger to this
  // payment. The owner recorded with the payment is passed so a different
  // stored guest is never used; the backend still decides ownership itself.
  const createOrder = useCallback(
    async (payload) => {
      const response = await submitPaidOrder(payload, {
        ownerUserId: readPaymentSession()?.ownerUserId ?? null,
      })

      if (!response.ok) {
        throw new OrderRefusedError(response.status)
      }

      const body = await response.json()
      const data = body?.data ?? body
      const code = data?.trackingCode

      if (typeof code !== 'string' || !code) {
        throw new Error('Order created but no tracking code was returned')
      }

      return code
    },
    [],
  )

  const finishOrder = useCallback(
    async (payload) => {
      // An EARLIER booking (its record was made for other inputs than the form
      // now holds) is completed without touching the customer's new details.
      const stored = readPaymentSession()
      const earlier = Boolean(stored) && stored.inputsHash !== inputsHash

      try {
        const code = await createOrder(payload)

        // ONLY place the payment record is cleared. Until this line runs, a
        // stored record means "paid, order still owed".
        clearPaymentSession()
        setTrackingCode(code)
        setCompletedBooking(bookingSummary(payload))

        if (earlier) {
          setPhase('earlierBookingDone')
          return
        }

        setPhase('done')
        flow.resetFlow()
      } catch (error) {
        // PAID BUT NO ORDER. Never offer to pay again from here. Only a payment
        // Stripe confirmed reaches this point (onPaid on 'succeeded', or the
        // recovery of a retrieved 'succeeded' intent).
        //
        // When sending the same stored body again cannot help — the checkout's
        // own guest is unavailable, or the backend refused it for identity,
        // validation or checkout reasons — go to support with the reference
        // instead of a retry loop.
        if (
          error instanceof OrderIdentityUnavailableError ||
          error?.outcome === ORDER_SUBMISSION.NEEDS_SUPPORT
        ) {
          setPhase('paidNeedsSupport')
          return
        }

        setFailureMessage(error?.message ?? 'Order creation failed')
        setPhase('orderFailed')
      }
    },
    [createOrder, flow, inputsHash],
  )

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!flow.hydrated || bootedRef.current) {
      return
    }

    bootedRef.current = true

    let cancelled = false

    async function boot() {
      // D7: a stored payment record is resolved FIRST, before any new-booking
      // guard, routing or price. A paid booking is completed from its ORIGINAL
      // checkout, whatever today's price, the Partner's standing or the form
      // now says; only a booking that is not already paid continues below.
      // Until the record is resolved, a failure must never be reported as
      // "you have not been charged".
      const stored = readPaymentSession()
      let storedPaymentResolved = !stored
      let reuseUnpaid = false

      try {
        // 1. Publishable key (public endpoint, no auth).
        const configResponse = await fetch(`${API_BASE_URL}/base/config`, {
          cache: 'no-store',
        })

        if (!configResponse.ok) {
          throw new Error('Could not load payment configuration')
        }

        const configBody = await configResponse.json()
        const key = (configBody?.data ?? configBody)?.stripe?.STRIPE_PUB_KEY

        if (typeof key !== 'string' || !key) {
          throw new Error('No publishable key returned')
        }

        if (cancelled) return
        setPublishableKey(key)

        // 2. Ask Stripe what happened to a stored intent, for EVERY pricing
        //    mode and whatever the current inputs. The only capability passed
        //    in is reading that one intent.
        if (stored) {
          paymentIntentIdRef.current = stored.paymentIntentId

          const decision = await inspectStoredPayment({
            stored,
            pricingMode: flow.pricingMode,
            inputsHash,
            retrieveIntent: async (clientSecret) => {
              const stripe = await getStripePromise(key)
              const { paymentIntent, error } =
                await stripe.retrievePaymentIntent(clientSecret)
              if (error) throw error
              return paymentIntent
            },
          })

          if (cancelled) return

          // R-M1: which booking this record is, and whether it is an earlier
          // one than the form now holds. Its details are shown only to the
          // guest that owns it (the backend still decides ownership).
          const earlier = stored.inputsHash !== inputsHash
          const owner = currentGuestUserId()
          const strangerToRecord =
            typeof stored.ownerUserId === 'string' &&
            typeof owner === 'string' &&
            stored.ownerUserId !== owner
          setPendingBooking({
            earlier,
            summary: strangerToRecord
              ? null
              : bookingSummary(decision.body ?? recoveryOrderBody(stored)),
            body: decision.action === STORED_PAYMENT.RECOVER ? decision.body : null,
          })

          if (decision.action === STORED_PAYMENT.RECOVER && !earlier) {
            // PAID ALREADY, for this same booking. Submit the body stored just
            // before the card was confirmed, unchanged, to the backend's
            // idempotent, verified order creation. Never a payment form,
            // never a new price.
            setPhase('recovering')
            await finishOrder(decision.body)
            return
          }

          if (decision.action === STORED_PAYMENT.RECOVER) {
            // PAID ALREADY, for an EARLIER booking than the one in the form.
            // Never completed silently: the customer sees which booking it is
            // and finishes it explicitly; the new details are left untouched
            // and no payment is offered until this one is resolved.
            setPhase('earlierBooking')
            return
          }

          if (decision.action === STORED_PAYMENT.PENDING) {
            setPhase('paymentPending')
            return
          }

          if (decision.action === STORED_PAYMENT.UNVERIFIABLE) {
            setPhase('paymentUnconfirmed')
            return
          }

          if (decision.action === STORED_PAYMENT.PAID_NEEDS_SUPPORT) {
            setPhase('paidNeedsSupport')
            return
          }

          // Not paid: the existing new-booking rules apply from here.
          if (decision.action === STORED_PAYMENT.DISCARD) {
            clearPaymentSession()
          }
          reuseUnpaid = decision.action === STORED_PAYMENT.REUSE_UNPAID
          if (!reuseUnpaid) {
            paymentIntentIdRef.current = null
          }
          storedPaymentResolved = true
        }

        // 3. NEW-BOOKING GUARDS — THE LAST GATE BEFORE ANY NEW STRIPE OBJECT.
        //
        // Every line below builds toward a real charge, and each one names the
        // vehicle: quote-itemized, get-fee (which mints the PaymentIntent), and
        // the order payload. A missing vehicle would be silently resolved to
        // the car by apiKeyFor's fallback, and an over-capacity car would be
        // refused by the backend only AFTER the card was charged — the
        // paid-but-no-order failure.
        //
        // Both are recoverable by going back one step, so this sends them there
        // rather than showing an error. Reached by a deep link, a restored
        // session predating the capacity rule, or a back-navigation that
        // changed the count.
        if (!hasBothAddresses(flow)) {
          router.replace(bookingHrefWithVia('/send', window.location.search))
          return
        }

        if (
          !flow.vehicle ||
          packageCapacityRefusal(flow.vehicle, flow.packageCount)
        ) {
          router.replace(bookingHrefWithVia('/send/details', window.location.search))
          return
        }

        // 4. Re-quote the selected mode from its backend authority. DropBatch
        // never trusts the amount shown on details; standard keeps its existing
        // quote-itemized path byte-for-byte. A NEW booking for a Partner that is
        // no longer eligible is refused here (the backend fails closed).
        let normalizedQuote
        if (flow.pricingMode === 'dropbatch') {
          const request = buildDropBatchQuoteRequest(flow, true)
          if (
            !request ||
            dropBatchQuoteSignature(request) !== flow.dropBatchSelectionKey
          ) {
            throw new Error(
              'Your DropBatch selection is no longer valid. Please review your delivery options.',
            )
          }

          const quoteData = await fetchDropBatchQuote(request)
          const senderPays = Number(quoteData?.senderPays)
          const routeDistanceKm = Number(quoteData?.routeDistanceKm)
          if (
            quoteData?.eligible !== true ||
            !Number.isFinite(senderPays) ||
            !Number.isFinite(routeDistanceKm)
          ) {
            throw new Error(
              'DropBatch is no longer available for these delivery details. Please review your options.',
            )
          }
          normalizedQuote = {
            lineItems: quoteData.lineItems
              ? {
                  base: quoteData.lineItems.deliveryFare,
                  serviceFee: quoteData.lineItems.serviceFee,
                }
              : { base: senderPays },
            total: senderPays,
            finalCustomerTotalMinor: quoteData.finalCustomerTotalMinor,
            distanceKm: routeDistanceKm,
          }
        } else {
          const quoteResponse = await referralQuoteFetch({
            senderLocation: {
              latitude: flow.pickup.lat,
              longitude: flow.pickup.lng,
            },
            receivers: [
              {
                receiverLocation: {
                  latitude: flow.dropoff.lat,
                  longitude: flow.dropoff.lng,
                },
                weight: weightKgFor(flow.weight),
              },
            ],
            vehicle: apiKeyFor(flow.vehicle),
            packageCount: flow.packageCount,
          })

          if (!quoteResponse.ok) {
            throw new Error('Could not price this delivery')
          }

          const quoteBody = await quoteResponse.json()
          const quoteData = quoteBody?.data ?? quoteBody
          normalizedQuote = normalizeCustomerQuote(quoteData)
        }

        if (!normalizedQuote || !Number.isFinite(normalizedQuote.total)) {
          throw new Error('Could not price this delivery')
        }

        if (cancelled) return
        setQuote(normalizedQuote)

        // 5. Reuse a STANDARD intent that Stripe confirmed above is UNPAID and
        // was minted for exactly these inputs, rather than minting a second
        // one. A stored DropBatch intent is never payment authority for a later
        // page load (step 2 discarded it): the same shipment inputs can receive
        // a different authoritative DropBatch price. The fresh quote above is
        // shown now; get-fee remains behind the customer's explicit continue
        // action below.
        if (reuseUnpaid) {
          if (Math.round(Number(stored.fee) * 100) !== normalizedQuote.finalCustomerTotalMinor) {
            setFailureMessage('The price has changed. Please review your delivery quote.')
            setPhase('priceMismatch')
            return
          }
          setClientSecret(stored.clientSecret)
          setFee(Number(stored.fee))
          setReferralAdjustment(Number(stored.referralAdjustment) || 0)
          setPhase('ready')
          return
        }

        // 6. No usable intent, and boot does NOT create one. get-fee mints a
        //    real PaymentIntent, so it cannot run before the contact details
        //    it requires have been typed — it fires from the confirm button
        //    below. The page is usable now: contact fields plus a breakdown
        //    priced by the side-effect-free quote above.
        setPhase('ready')
      } catch (error) {
        if (!cancelled) {
          setFailureMessage(error?.message ?? 'Something went wrong')
          // "You have not been charged" is only true once any stored payment
          // has been confirmed unpaid (or there was none).
          setPhase(storedPaymentResolved ? 'error' : 'paymentUnconfirmed')
        }
      }
    }

    boot()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.hydrated])

  // ── Confirm → create the PaymentIntent ────────────────────────────────────
  //
  // THE ONLY CALL TO get-fee, and the only line in the flow that creates a
  // Stripe object. It sits behind a button rather than on mount for two
  // reasons: the backend rejects the request until the sender and receiver
  // contact details exist, and those are typed on this page — so an on-mount
  // call is guaranteed to 400. And even if it succeeded it would mint a live
  // PaymentIntent for someone who has done nothing but open a page.
  //
  // IT MUST FIRE AT MOST ONCE. `feePending` blocks a second click while the
  // request is open; success sets `clientSecret`, which replaces this button
  // with the card form for the rest of this page's life.
  const confirmAndCreateIntent = useCallback(async () => {
    if (feePending || clientSecret) {
      return
    }

    // The BACKEND's distance, from quote-itemized — never Google's. Same
    // reasoning as buildOrderPayload: the two routing engines disagree and this
    // is the number the fare was priced from.
    const distance = quote?.distanceKm

    // Required by the validator, and this is the only place it can come from.
    // Sending null earns a 400 that reads to the customer like a card problem,
    // so say what actually went wrong instead.
    if (!Number.isFinite(distance)) {
      setConfirmError(
        'We could not confirm the distance for this trip. Please go back and re-enter the addresses.',
      )
      return
    }

    setFeePending(true)
    setConfirmError(null)

    try {
      const { contact } = flow

      const feeResponse = await referralCheckoutFetch({
          ...(flow.pricingMode === 'dropbatch'
            ? {
                pricingMode: 'dropbatch',
                type:
                  flow.pickupTiming === 'scheduled'
                    ? 'scheduled_pickup'
                    : 'instant_pickup',
                ...(flow.pickupTiming === 'scheduled'
                  ? { pickUpTime: flow.scheduledPickupAt }
                  : {}),
              }
            : {}),
          senderName: contact.senderName.trim(),
          senderPhone: contact.senderPhone.trim(),
          senderAddress: flow.pickup.address,
          senderLocation: {
            latitude: flow.pickup.lat,
            longitude: flow.pickup.lng,
          },
          // Normalised key ('cargovan', never the local 'cargo' id).
          vehicle: apiKeyFor(flow.vehicle),
          paymentMethod: 'card',
          // 'other' for general consumer packages, unless a ?section= preset
          // set one of the other whitelisted values on step 1.
          section: flow.section ?? 'other',
          packageCount: flow.packageCount,
          receivers: [
            {
              receiverName: contact.receiverName.trim(),
              receiverPhone: contact.receiverPhone.trim(),
              // Only sent when actually provided — an empty string can read as
              // "supplied but blank" to a validator.
              receiverEmail: contact.receiverEmail.trim() || undefined,
              receiverAddress: flow.dropoff.address,
              receiverLocation: {
                latitude: flow.dropoff.lat,
                longitude: flow.dropoff.lng,
              },
              weight: weightKgFor(flow.weight),
              distance,
            },
          ],
      })

      if (!feeResponse.ok) {
        throw new Error('Could not set up payment')
      }

      const feeBody = await feeResponse.json()
      const feeData = feeBody?.data ?? feeBody
      const feeAmount = Number(feeData?.fee)
      const chargedAmount = Number(feeData?.amountMinor) / 100
      const channelAdjustment = Number(feeData?.referralAdjustmentMinor ?? 0) / 100
      const intentId = feeData?.paymentIntentId
      const secret = feeData?.paymentIntentSecret

      if (
        !Number.isFinite(feeAmount) ||
        !Number.isFinite(chargedAmount) ||
        typeof intentId !== 'string' ||
        typeof secret !== 'string'
      ) {
        throw new Error('Payment setup returned an unexpected response')
      }

      // The price must not have moved between the quote on mount and here. If
      // it has, something is wrong and the customer must not pay a number they
      // were never shown. Nothing has been charged at this point.
      const previewMinor = quote.finalCustomerTotalMinor ?? Math.round(quote.total * 100)
      const paymentMinor = Number(feeData?.amountMinor)
      if (!Number.isSafeInteger(paymentMinor) || paymentMinor !== previewMinor) {
        // The newly-created intent has not entered active UI or storage, and
        // any prior same-input DropBatch record must remain unusable. The
        // customer reviews/requotes rather than silently paying Standard.
        if (flow.pricingMode === 'dropbatch') {
          clearPaymentSession()
        }
        setFailureMessage('The price has changed. Please review your delivery quote.')
        setPhase('priceMismatch')
        return
      }

      paymentIntentIdRef.current = intentId

      // Recorded only after the authoritative fee has matched the fresh quote.
      // Standard can recover/reuse this record on refresh; DropBatch will
      // intentionally discard it and request a newly-authoritative intent.
      // orderPayload is added just before confirmPayment, once the contact
      // details are known.
      writePaymentSession({
        inputsHash,
        paymentIntentId: intentId,
        clientSecret: secret,
        fee: chargedAmount,
        referralAdjustment: channelAdjustment,
        // The guest that just created this checkout. While this record exists
        // that guest is never replaced, and an order for this payment is never
        // sent as anyone else (a client-side guard; the backend decides).
        ownerUserId: currentGuestUserId(),
      })

      setReferralAdjustment(channelAdjustment)
      setFee(chargedAmount)
      // Last, and the point of no return for this button: the card form takes
      // its place from here on.
      setClientSecret(secret)
    } catch (error) {
      setConfirmError(
        error?.message ?? 'Could not set up payment. Please try again.',
      )
    } finally {
      setFeePending(false)
    }
  }, [feePending, clientSecret, quote, flow, inputsHash])

  // Written immediately before confirmPayment — see PaymentForm.
  const persistBeforeConfirm = useCallback(() => {
    writePaymentSession({
      inputsHash,
      paymentIntentId: paymentIntentIdRef.current,
      clientSecret,
      fee,
      referralAdjustment,
      orderPayload: buildOrderPayload({
        flow,
        quote,
        paymentIntentId: paymentIntentIdRef.current,
      }),
      // Keep the owner recorded when the checkout was created.
      ownerUserId: readPaymentSession()?.ownerUserId ?? currentGuestUserId(),
    })
  }, [inputsHash, clientSecret, fee, referralAdjustment, flow, quote])

  const handlePaid = useCallback(async () => {
    setPhase('placing')
    await finishOrder(
      buildOrderPayload({
        flow,
        quote,
        paymentIntentId: paymentIntentIdRef.current,
      }),
    )
  }, [finishOrder, flow, quote])

  // Payment outcome unknown. Do not show a pay button again, and make no claim
  // either way — the card may or may not have been charged. "Check again"
  // reloads, and boot asks Stripe for the truth before anything else.
  const handleIndeterminate = useCallback(() => {
    setPhase('paymentIndeterminate')
  }, [])

  // Retries ORDER CREATION with the body stored before the card was confirmed —
  // the original checkout, never one rebuilt from the current form or price.
  const retryOrder = useCallback(async () => {
    const stored = readPaymentSession()
    const body = recoveryOrderBody(stored)

    if (!body) {
      setPhase('paidNeedsSupport')
      return
    }

    setRetrying(true)
    setPhase('recovering')

    await finishOrder(body)

    setRetrying(false)
  }, [finishOrder])

  // R-M1: the customer's explicit "Finish my earlier booking". Submits that
  // booking's stored original body (never the form), exactly once even if the
  // button is pressed twice in the same tick, and keeps the new booking intact.
  const finishEarlierBooking = useCallback(async () => {
    if (finishingEarlierRef.current) {
      return
    }

    const body = pendingBooking?.body

    if (!body) {
      setPhase('paidNeedsSupport')
      return
    }

    finishingEarlierRef.current = true
    setPhase('recovering')

    try {
      await finishOrder(body)
    } finally {
      finishingEarlierRef.current = false
    }
  }, [finishOrder, pendingBooking])

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === 'done') {
    return (
      <div className="px-6 py-14 text-center sm:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl ring-1 ring-inset ring-emerald-200">
          <span role="img" aria-hidden>
            ✅
          </span>
        </div>
        <h1 className="mt-6 text-[26px] font-extrabold tracking-[-0.02em] text-[#17131c]">
          Your delivery is booked
        </h1>
        {/* Names the booking the order was actually created for, and takes its
            copy from that order (the form has just been reset). */}
        <BookingLine summary={completedBooking} centered />
        {completedBooking?.pricingMode === 'dropbatch' ? (
          <div className="mt-3 text-[15px] text-[#5f5868]">
            {/* A just-paid DropBatch order is always in `waiting`, so this states that meaning and
                nothing further. It used to close by pointing the customer at Standard Delivery,
                which reads as an offer to convert this paid order — no such conversion exists:
                pricingMode is never mutated after creation and there is no top-up charge primitive.
                Live state from here on comes from the backend's own message via tracking. */}
            <p className="font-bold text-[#17131c]">Finding a DropBatch driver</p>
            <p className="mt-1">We&rsquo;re looking for a driver already travelling in your direction. Matching can take longer than Standard Delivery.</p>
            <p className="mt-2">No driver is assigned yet. Track your delivery to follow the match.</p>
          </div>
        ) : (
          <p className="mt-3 text-[15px] text-[#5f5868]">
            We&rsquo;ve got it. Track it any time with the code below.
          </p>
        )}

        <div className="mx-auto mt-6 max-w-[320px] rounded-2xl bg-[#faf7fd] p-5">
          <div className="text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
            TRACKING CODE
          </div>
          <div className="mt-1.5 text-[22px] font-extrabold text-[#17131c]">
            {trackingCode}
          </div>
        </div>

        <Link
          href={`/track/${trackingCode}`}
          className="mx-auto mt-6 block max-w-[320px] rounded-xl bg-brand-600 px-5 py-4 text-[16px] font-bold text-white transition-colors hover:bg-brand-700"
        >
          Track your delivery
        </Link>
      </div>
    )
  }

  if (phase === 'orderFailed') {
    return (
      <div className="px-6 py-14 sm:px-8">
        <div className="mx-auto max-w-[560px]">
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#17131c]">
            Your payment went through — we&rsquo;re finishing your order
          </h1>
          {/* Reached only after Stripe confirmed the payment (see finishOrder),
              so "confirmed" is a verified statement here. Nothing here may claim
              what this page cannot see (other tabs, devices or lost records). */}
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5f5868]">
            Your payment was confirmed, but we couldn&rsquo;t create the
            delivery yet. We&rsquo;re recovering your original booking: retrying
            finishes it and doesn&rsquo;t start another payment. If it keeps
            failing, contact us with the reference below.
          </p>
          <EarlierBookingNote booking={pendingBooking} />

          <div className="mt-5 rounded-2xl bg-[#faf7fd] p-4">
            <div className="text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
              PAYMENT REFERENCE
            </div>
            <div className="mt-1 break-all font-mono text-[14px] text-[#17131c]">
              {paymentIntentIdRef.current ?? '—'}
            </div>
            {failureMessage && (
              <p className="mt-3 text-[13px] text-[#5f5868]">
                {failureMessage}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {/* Retries ORDER CREATION with the same intent. There is
                deliberately no way to pay again from this screen. */}
            <button
              type="button"
              onClick={retryOrder}
              disabled={retrying}
              className="rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-[#ece7f1] disabled:text-[#9b93a5]"
            >
              {retrying ? 'Retrying…' : 'Retry my order'}
            </button>
            <Link
              href="/contact-us"
              className="rounded-xl border-[1.5px] border-[#e3dfe8] px-6 py-3.5 text-[15px] font-bold text-[#17131c] transition-colors hover:bg-[#faf7fd]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // R-M1: a paid record for an EARLIER booking than the one in the form. Shown
  // instead of completing it silently. No payment is offered here; the new
  // booking's details stay as they are.
  if (phase === 'earlierBooking') {
    return (
      <div className="px-6 py-14 sm:px-8">
        <div className="mx-auto max-w-[560px]">
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#17131c]">
            Your earlier booking needs to be finished first
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5f5868]">
            You paid for an earlier booking in this tab, but it hasn&rsquo;t been
            created yet. Finish it first — this doesn&rsquo;t start another
            payment. The booking you&rsquo;re entering now is kept and isn&rsquo;t
            affected.
          </p>
          <div className="mt-5 rounded-2xl bg-[#faf7fd] p-4">
            <div className="text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
              EARLIER BOOKING
            </div>
            {pendingBooking?.summary ? (
              <BookingLine summary={pendingBooking.summary} />
            ) : (
              <p className="mt-1 text-[14px] text-[#5f5868]">
                Its details aren&rsquo;t shown on this device.
              </p>
            )}
            <div className="mt-3 text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
              PAYMENT REFERENCE
            </div>
            <div className="mt-1 break-all font-mono text-[14px] text-[#17131c]">
              {paymentIntentIdRef.current ?? '—'}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={finishEarlierBooking}
              className="rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-700"
            >
              Finish my earlier booking
            </button>
            <Link
              href="/contact-us"
              className="rounded-xl border-[1.5px] border-[#e3dfe8] px-6 py-3.5 text-[15px] font-bold text-[#17131c] transition-colors hover:bg-[#faf7fd]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'earlierBookingDone') {
    return (
      <div className="px-6 py-14 text-center sm:px-8">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em] text-[#17131c]">
          Your earlier booking is booked
        </h1>
        <BookingLine summary={completedBooking} centered />
        <div className="mx-auto mt-6 max-w-[320px] rounded-2xl bg-[#faf7fd] p-5">
          <div className="text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
            TRACKING CODE
          </div>
          <div className="mt-1.5 text-[22px] font-extrabold text-[#17131c]">
            {trackingCode}
          </div>
        </div>
        <Link
          href={`/track/${trackingCode}`}
          className="mx-auto mt-6 block max-w-[320px] rounded-xl border-[1.5px] border-[#e3dfe8] px-5 py-4 text-[16px] font-bold text-[#17131c] transition-colors hover:bg-[#faf7fd]"
        >
          Track this delivery
        </Link>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mx-auto mt-3 block w-full max-w-[320px] rounded-xl bg-brand-600 px-5 py-4 text-[16px] font-bold text-white transition-colors hover:bg-brand-700"
        >
          Continue with your new booking
        </button>
      </div>
    )
  }

  // D7 recovery states. None of them offers a way to pay, and none claims the
  // customer was not charged: each describes what is actually known.
  if (phase === 'paymentIndeterminate') {
    return (
      <div className="px-6 py-14 sm:px-8">
        <div className="mx-auto max-w-[560px]">
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#17131c]">
            We couldn&rsquo;t confirm the result of your payment
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5f5868]">
            Your payment provider didn&rsquo;t give us a clear answer, so we
            don&rsquo;t know yet whether this payment went through. Please
            don&rsquo;t pay again until it is verified. Check again and we will
            ask the payment provider, or contact us with the reference below.
          </p>
          <div className="mt-5 rounded-2xl bg-[#faf7fd] p-4">
            <div className="text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
              PAYMENT REFERENCE
            </div>
            <div className="mt-1 break-all font-mono text-[14px] text-[#17131c]">
              {paymentIntentIdRef.current ?? '—'}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-700"
            >
              Check again
            </button>
            <Link
              href="/contact-us"
              className="rounded-xl border-[1.5px] border-[#e3dfe8] px-6 py-3.5 text-[15px] font-bold text-[#17131c] transition-colors hover:bg-[#faf7fd]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'paymentPending') {
    return (
      <div className="px-6 py-14 sm:px-8">
        <div className="mx-auto max-w-[560px]">
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#17131c]">
            Your payment is still processing
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5f5868]">
            Your payment provider has not finished confirming this payment, so
            your delivery is not booked yet. Please don&rsquo;t pay again. Check
            again in a minute, or contact us with the reference below.
          </p>
          <EarlierBookingNote booking={pendingBooking} />
          <div className="mt-5 rounded-2xl bg-[#faf7fd] p-4">
            <div className="text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
              PAYMENT REFERENCE
            </div>
            <div className="mt-1 break-all font-mono text-[14px] text-[#17131c]">
              {paymentIntentIdRef.current ?? '—'}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-700"
            >
              Check again
            </button>
            <Link
              href="/contact-us"
              className="rounded-xl border-[1.5px] border-[#e3dfe8] px-6 py-3.5 text-[15px] font-bold text-[#17131c] transition-colors hover:bg-[#faf7fd]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'paymentUnconfirmed') {
    return (
      <div className="px-6 py-14 sm:px-8">
        <div className="mx-auto max-w-[560px]">
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#17131c]">
            We couldn&rsquo;t confirm your earlier payment
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5f5868]">
            This page holds a payment from your earlier visit that we could not
            check just now. Please don&rsquo;t pay again until it is confirmed.
            Check again, or contact us with the reference below.
          </p>
          <EarlierBookingNote booking={pendingBooking} />
          <div className="mt-5 rounded-2xl bg-[#faf7fd] p-4">
            <div className="text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
              PAYMENT REFERENCE
            </div>
            <div className="mt-1 break-all font-mono text-[14px] text-[#17131c]">
              {paymentIntentIdRef.current ?? '—'}
            </div>
            {failureMessage && (
              <p className="mt-3 text-[13px] text-[#5f5868]">
                {failureMessage}
              </p>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-700"
            >
              Check again
            </button>
            <Link
              href="/contact-us"
              className="rounded-xl border-[1.5px] border-[#e3dfe8] px-6 py-3.5 text-[15px] font-bold text-[#17131c] transition-colors hover:bg-[#faf7fd]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'paidNeedsSupport') {
    return (
      <div className="px-6 py-14 sm:px-8">
        <div className="mx-auto max-w-[560px]">
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#17131c]">
            Your payment went through — we need to finish your order
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5f5868]">
            We couldn&rsquo;t complete your delivery automatically from this
            device. Please don&rsquo;t pay again: contact us with the reference
            below and we&rsquo;ll resolve it with you.
          </p>
          <EarlierBookingNote booking={pendingBooking} />
          <div className="mt-5 rounded-2xl bg-[#faf7fd] p-4">
            <div className="text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
              PAYMENT REFERENCE
            </div>
            <div className="mt-1 break-all font-mono text-[14px] text-[#17131c]">
              {paymentIntentIdRef.current ?? '—'}
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/contact-us"
              className="inline-block rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-700"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'priceMismatch') {
    return (
      <div className="px-6 py-14 sm:px-8">
        <div className="mx-auto max-w-[560px]">
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#17131c]">
            The price changed
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5f5868]">
            {failureMessage} You have not been charged. Please review your
            delivery and try again.
          </p>
          <Link
            data-booking-return href="/send/details"
            className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-700"
          >
            Back to delivery details
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'booting' || phase === 'recovering' || phase === 'placing') {
    return (
      <div className="px-6 py-20 text-center text-[15px] text-[#5f5868] sm:px-8">
        {phase === 'booting'
          ? 'Setting up your payment…'
          : 'Finishing your order — do not close this page.'}
      </div>
    )
  }

  // Deliberately does NOT test clientSecret. Before confirm there is no intent
  // yet, and that is the page's normal resting state — not an error.
  if (phase === 'error' || !publishableKey || !quote) {
    return (
      <div className="px-6 py-14 sm:px-8">
        <div className="mx-auto max-w-[560px]">
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#17131c]">
            We couldn&rsquo;t set up payment
          </h1>
          <p className="mt-3 text-[15px] text-[#5f5868]">
            {failureMessage ?? 'Please try again in a moment.'} You have not
            been charged.
          </p>
          <Link
            data-booking-return href="/send/details"
            className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-700"
          >
            Back to delivery details
          </Link>
        </div>
      </div>
    )
  }

  const vehicle = vehicleById(flow.vehicle)
  const weightLabel = WEIGHT_OPTIONS.find(
    (option) => option.id === flow.weight,
  )?.label
  const contactReady = contactIsComplete(flow.contact)

  // Stricter than contactIsComplete, which accepts a recipient email in place
  // of a phone. get-fee requires receiverPhone outright, so an email-only
  // contact would pass that check and still 400.
  const filled = (value) => typeof value === 'string' && value.trim().length > 0
  const canConfirm =
    filled(flow.contact.senderName) &&
    filled(flow.contact.senderPhone) &&
    filled(flow.contact.receiverName) &&
    filled(flow.contact.receiverPhone)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px]">
      <div className="px-6 py-8 sm:px-8">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em] text-[#17131c]">
          Payment
        </h1>
        <p className="mt-2 text-[15px] text-[#5f5868]">
          Your card is charged now to place this delivery.
        </p>

        <div className="mt-7">
          <ContactFields
            contact={flow.contact}
            onChange={flow.setContactField}
          />
        </div>

        <div className="mt-8">
          <div className="mb-3 text-[13px] font-extrabold tracking-[0.08em] text-[#8d8695]">
            PAYMENT
          </div>

          {/* No intent yet: the confirm button is the only thing that can
              create one. Once clientSecret exists — whether from this button or
              recovered from a previous visit — the button is gone for good and
              the card form takes over. That swap IS the once-only guard. */}
          {clientSecret ? (
            <Elements
              stripe={getStripePromise(publishableKey)}
              options={{ clientSecret, appearance: ELEMENTS_APPEARANCE }}
            >
              <PaymentForm
                amount={fee}
                canPay={contactReady}
                blockedReason="Fill in the contact details above to pay."
                onBeforeConfirm={persistBeforeConfirm}
                onPaid={handlePaid}
                onIndeterminate={handleIndeterminate}
              />
            </Elements>
          ) : (
            <div>
              <button
                type="button"
                onClick={confirmAndCreateIntent}
                disabled={!canConfirm || feePending}
                className={`w-full rounded-xl px-5 py-[18px] text-[16px] font-bold transition-colors ${
                  !canConfirm || feePending
                    ? 'cursor-not-allowed bg-[#ece7f1] text-[#9b93a5]'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
              >
                {feePending
                  ? 'Setting up payment…'
                  : 'Confirm & continue to payment'}
              </button>

              {confirmError && (
                <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-[14px] text-rose-700">
                  {confirmError} You have not been charged.
                </p>
              )}

              {!canConfirm && (
                <p className="mt-3 text-center text-[13px] text-[#8d8695]">
                  Fill in the contact details above to continue.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col border-t border-[#f0eef2] bg-[#faf7fd] px-6 py-8 sm:px-8 lg:border-l lg:border-t-0">
        <div className="mb-5 rounded-2xl bg-white p-4 text-[14px] leading-[1.6]">
          <div className="font-bold text-[#17131c]">
            {vehicle.name} · {flow.packageCount}{' '}
            {flow.packageCount === 1 ? 'package' : 'packages'} · {weightLabel}
          </div>
          <div className="mt-1 text-[#5f5868]">
            {flow.pickup.address} → {flow.dropoff.address}
          </div>
        </div>

        {flow.pricingMode === 'dropbatch' ? (
          <div className="rounded-2xl bg-white p-5">
            <div className="text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
              DROPBATCH PRICE
            </div>
            <div className="mt-2 text-[30px] font-extrabold text-[#17131c]">
              {formatMoney(quote.total)}
            </div>
            {quote.lineItems?.serviceFee > 0 && (
              <div className="mt-3 space-y-1 text-[14px] text-[#5f5868]">
                <div className="flex justify-between gap-4"><span>Delivery fare</span><span>{formatMoney(quote.lineItems.base)}</span></div>
                <div className="flex justify-between gap-4"><span>Service fee</span><span>{formatMoney(quote.lineItems.serviceFee)}</span></div>
              </div>
            )}
            <p className="mt-2 text-[14px] leading-[1.6] text-[#5f5868]">
              Backend-confirmed DropBatch price for{' '}
              {quote.distanceKm.toFixed(1)} km.
            </p>
            {/* The last screen before the customer pays. It has to restate what the
                money buys — a driver already going this way — because the choice was
                made a screen ago and the confirmation screen comes too late. */}
            <p className="mt-2 text-[14px] leading-[1.6] text-[#5f5868]">
              {DROPBATCH_EXPLANATION}
            </p>
            <p className="mt-2 text-[13px] leading-[1.6] text-[#756d7e]">
              {DROPBATCH_NO_PROMISE}
            </p>
          </div>
        ) : (
          <>
            <PriceBreakdown
              quote={quote}
              vehicleName={vehicle.name}
              packageCount={flow.packageCount}
              weightLabel={weightLabel}
            />
          </>
        )}
      </div>
    </div>
  )
}
