'use client'

import { useState } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

import { formatMoney } from '@/components/send/PriceBreakdown'

// The card form. Rendered inside <Elements> with the clientSecret from get-fee.
//
// PaymentElement, not CardElement: CardElement is the legacy single-field input
// with no wallet support. Apple Pay and Google Pay appear in PaymentElement
// automatically for a card-capable intent on a verified domain — they are card
// wallets, not separate payment method types, so no backend change is needed.

// Which failures are safe to retry.
//
// A card decline or a validation error means Stripe rejected the attempt before
// any money moved, so offering the button again is correct and expected.
//
// ANY OTHER failure — a dropped connection, a timeout, an unknown error — means
// we genuinely do not know whether the charge went through. Re-enabling the
// button there invites a second charge for the same delivery. Those cases keep
// the button disabled and route to recovery, which re-reads the intent's real
// status from Stripe rather than guessing.
const SAFE_TO_RETRY = new Set(['card_error', 'validation_error'])

export function PaymentForm({
  amount,
  canPay,
  blockedReason,
  onBeforeConfirm,
  onPaid,
  onIndeterminate,
}) {
  const stripe = useStripe()
  const elements = useElements()

  // Once true, this only ever goes back to false on a known-safe retry.
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const ready = Boolean(stripe && elements)

  async function handlePay() {
    // Guard against a double-click landing a second call before React has
    // re-rendered with the disabled button.
    if (!ready || busy) {
      return
    }

    setBusy(true)
    setError(null)

    try {
      // ── PERSIST BEFORE CONFIRMING ────────────────────────────────────────
      // Written synchronously, before the network call. If the tab dies, the
      // laptop closes, or the customer refreshes while Stripe is working, the
      // next mount finds this record and can recover. Writing it afterwards
      // would leave exactly the window this is meant to close.
      onBeforeConfirm()

      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/send/pay`,
        },
        // Card payments settle in-page; only methods that genuinely need a
        // redirect will navigate away.
        redirect: 'if_required',
      })

      if (stripeError) {
        if (SAFE_TO_RETRY.has(stripeError.type)) {
          setError(
            stripeError.message ??
              'That card was declined. Please try another card.',
          )
          setBusy(false)
          return
        }

        // Outcome unknown — do NOT re-enable the button.
        onIndeterminate()
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        // Deliberately leaves `busy` true. The customer has paid; there is
        // nothing left for them to press.
        await onPaid(paymentIntent)
        return
      }

      // 'processing' and anything else: the charge may still complete. Treat it
      // as unknown rather than as a failure.
      onIndeterminate()
    } catch (caught) {
      // Threw rather than returning an error — outcome unknown for the same
      // reason as above.
      onIndeterminate()
    }
  }

  const disabled = !ready || busy || !canPay

  return (
    <div>
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-[14px] text-rose-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={disabled}
        className={`mt-5 w-full rounded-xl px-5 py-[18px] text-[16px] font-bold transition-colors ${
          disabled
            ? 'cursor-not-allowed bg-[#ece7f1] text-[#9b93a5]'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {busy ? 'Processing…' : `Pay ${formatMoney(amount)} and send`}
      </button>

      {!canPay && blockedReason && (
        <p className="mt-3 text-center text-[13px] text-[#8d8695]">
          {blockedReason}
        </p>
      )}

      {/* Factually accurate, unlike the design's "Cards are charged when the
          driver collects" — the charge happens here, before the order exists. */}
      <p className="mt-3 text-center text-[12px] text-[#8d8695]">
        Your card is charged now to place this delivery.
      </p>
    </div>
  )
}
