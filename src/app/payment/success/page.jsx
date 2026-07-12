import Link from 'next/link'

// Stripe's success_url points here. The `order` param carries the trackingCode,
// but never assume it is present — Stripe can be reached without it, and a
// customer landing here without a code should still see their confirmation.
function readOrderParam(searchParams) {
  const value = searchParams?.order

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : null
}

export const metadata = {
  title: 'Payment successful | LegalDrop',
}

export default function PaymentSuccessPage({ searchParams }) {
  const order = readOrderParam(searchParams)

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-emerald-100 bg-white p-10 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl ring-1 ring-inset ring-emerald-200">
          <span role="img" aria-hidden>
            ✅
          </span>
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          Order Payment
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">
          Payment successful
        </h1>
        <p className="mt-4 text-sm text-slate-600">
          Your payment was received and your order is confirmed.
        </p>

        {order && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Tracking Code
            </span>
            <p className="mt-1 font-medium text-slate-900">{order}</p>
          </div>
        )}

        {order && (
          <Link
            href={`/track/${order}`}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-purple-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-purple-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
          >
            Track your delivery
          </Link>
        )}

        <p className="pt-8 text-center text-xs text-slate-500">
          Secure payments powered by Stripe.
        </p>
      </div>
    </main>
  )
}
