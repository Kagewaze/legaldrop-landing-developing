'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { API_BASE_URL } from '@/lib/config'
import { guestFetch } from '@/lib/guest-session'
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
import { buildOrderPayload } from '@/components/send/buildOrderPayload'
import { apiKeyFor, vehicleById } from '@/components/send/vehicles'

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

export default function SendPayPage() {
  const router = useRouter()
  const flow = useSendFlow()

  // booting | ready | recovering | placing | done | orderFailed | priceMismatch | error
  const [phase, setPhase] = useState('booting')
  const [publishableKey, setPublishableKey] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [quote, setQuote] = useState(null)
  const [fee, setFee] = useState(null)
  const [trackingCode, setTrackingCode] = useState(null)
  const [failureMessage, setFailureMessage] = useState(null)
  const [retrying, setRetrying] = useState(false)

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
  const createOrder = useCallback(
    async (payload) => {
      const response = await guestFetch('/order', {
        method: 'POST',
        body: payload,
      })

      if (!response.ok) {
        throw new Error(`Order creation failed (${response.status})`)
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
      try {
        const code = await createOrder(payload)

        // ONLY place the payment record is cleared. Until this line runs, a
        // stored record means "paid, order still owed".
        clearPaymentSession()
        setTrackingCode(code)
        setPhase('done')
        flow.resetFlow()
      } catch (error) {
        // PAID BUT NO ORDER. Never offer to pay again from here.
        setFailureMessage(error?.message ?? 'Order creation failed')
        setPhase('orderFailed')
      }
    },
    [createOrder, flow],
  )

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!flow.hydrated || bootedRef.current) {
      return
    }

    if (!hasBothAddresses(flow)) {
      router.replace('/send')
      return
    }

    bootedRef.current = true

    let cancelled = false

    async function boot() {
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

        // 2. Quote. Side-effect-free, and needed for the breakdown, for
        //    receivers[].distance, and to validate the fee at confirm time.
        const quoteResponse = await guestFetch('/order/quote-itemized', {
          method: 'POST',
          body: {
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
          },
        })

        if (!quoteResponse.ok) {
          throw new Error('Could not price this delivery')
        }

        const quoteBody = await quoteResponse.json()
        const quoteData = quoteBody?.data ?? quoteBody
        const normalizedQuote = {
          lineItems: {
            base: Number(quoteData?.lineItems?.base) || 0,
            distance: Number(quoteData?.lineItems?.distance) || 0,
            extraPackage: Number(quoteData?.lineItems?.extraPackage) || 0,
            labour: Number(quoteData?.lineItems?.labour) || 0,
            heavyFee: Number(quoteData?.lineItems?.heavyFee) || 0,
          },
          total: Number(quoteData?.total),
          distanceKm: Number(quoteData?.distanceKm),
        }

        if (!Number.isFinite(normalizedQuote.total)) {
          throw new Error('Could not price this delivery')
        }

        if (cancelled) return
        setQuote(normalizedQuote)

        // 3. Recover, or create an intent.
        const stored = readPaymentSession()

        if (stored && stored.inputsHash === inputsHash) {
          // An intent already exists for exactly these inputs. Before showing
          // any form, ask Stripe what actually happened to it — the customer
          // may already have paid and simply not have an order yet.
          const stripe = await getStripePromise(key)
          const { paymentIntent } = await stripe.retrievePaymentIntent(
            stored.clientSecret,
          )

          if (cancelled) return

          paymentIntentIdRef.current = stored.paymentIntentId

          if (paymentIntent?.status === 'succeeded') {
            // PAID ALREADY. Never render a fresh PaymentElement here — that is
            // exactly the path that charges someone twice.
            setPhase('recovering')

            const payload =
              stored.orderPayload ??
              buildOrderPayload({
                flow,
                quote: normalizedQuote,
                paymentIntentId: stored.paymentIntentId,
              })

            await finishOrder(payload)
            return
          }

          // Not paid yet — safe to reuse the same intent rather than minting a
          // second one.
          setClientSecret(stored.clientSecret)
          setFee(Number(stored.fee))
          setPhase('ready')
          return
        }

        // 4. No usable intent, and boot does NOT create one. get-fee mints a
        //    real PaymentIntent, so it cannot run before the contact details
        //    it requires have been typed — it fires from the confirm button
        //    below. The page is usable now: contact fields plus a breakdown
        //    priced by the side-effect-free quote above.
        setPhase('ready')
      } catch (error) {
        if (!cancelled) {
          setFailureMessage(error?.message ?? 'Something went wrong')
          setPhase('error')
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

      const feeResponse = await guestFetch('/order/get-fee', {
        method: 'POST',
        body: {
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
          // Constant for general consumer packages.
          section: 'other',
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
        },
      })

      if (!feeResponse.ok) {
        throw new Error('Could not set up payment')
      }

      const feeBody = await feeResponse.json()
      const feeData = feeBody?.data ?? feeBody
      const feeAmount = Number(feeData?.fee)
      const intentId = feeData?.paymentIntentId
      const secret = feeData?.paymentIntentSecret

      if (
        !Number.isFinite(feeAmount) ||
        typeof intentId !== 'string' ||
        typeof secret !== 'string'
      ) {
        throw new Error('Payment setup returned an unexpected response')
      }

      // The price must not have moved between the quote on mount and here. If
      // it has, something is wrong and the customer must not pay a number they
      // were never shown. Nothing has been charged at this point.
      if (Math.abs(feeAmount - quote.total) >= 0.01) {
        setFailureMessage(
          `The price changed from ${formatMoney(quote.total)} to ${formatMoney(
            feeAmount,
          )}.`,
        )
        setPhase('priceMismatch')
        return
      }

      paymentIntentIdRef.current = intentId

      // Recorded as soon as it exists, so returning to this step reuses it
      // rather than minting another. orderPayload is added just before
      // confirmPayment, once the contact details are known.
      writePaymentSession({
        inputsHash,
        paymentIntentId: intentId,
        clientSecret: secret,
        fee: feeAmount,
      })

      setFee(feeAmount)
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
      orderPayload: buildOrderPayload({
        flow,
        quote,
        paymentIntentId: paymentIntentIdRef.current,
      }),
    })
  }, [inputsHash, clientSecret, fee, flow, quote])

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

  // Payment outcome unknown. Do not show a pay button again; a reload runs the
  // recovery path above, which asks Stripe for the truth.
  const handleIndeterminate = useCallback(() => {
    setFailureMessage(
      'We could not confirm the result of your payment. Do not try again — reload this page and we will check with our payment provider.',
    )
    setPhase('orderFailed')
  }, [])

  const retryOrder = useCallback(async () => {
    const stored = readPaymentSession()

    if (!stored) {
      return
    }

    setRetrying(true)
    setPhase('recovering')

    await finishOrder(
      stored.orderPayload ??
        buildOrderPayload({
          flow,
          quote,
          paymentIntentId: stored.paymentIntentId,
        }),
    )

    setRetrying(false)
  }, [finishOrder, flow, quote])

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
        <p className="mt-3 text-[15px] text-[#5f5868]">
          We&rsquo;ve got it. Track it any time with the code below.
        </p>

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
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5f5868]">
            Your card has been charged and we could not create the delivery.
            Nothing further is needed from you and{' '}
            <strong className="font-bold text-[#17131c]">
              you have not been charged twice
            </strong>
            . Retry below, or contact us with the reference and we will complete
            it for you.
          </p>

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
            href="/send/details"
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
            href="/send/details"
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

        <PriceBreakdown
          quote={quote}
          vehicleName={vehicle.name}
          packageCount={flow.packageCount}
          weightLabel={weightLabel}
        />
      </div>
    </div>
  )
}
