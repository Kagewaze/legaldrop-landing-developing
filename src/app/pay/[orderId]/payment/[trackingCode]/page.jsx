import Image from 'next/image'
import Link from 'next/link'

import { PaymentAlert } from './PaymentAlert'

const API_BASE_URL =
  'https://seal-app-9hhnm.ondigitalocean.app/api/order/external-payment'

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
})

function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    const numericValue = Number(amount)
    if (Number.isNaN(numericValue)) {
      return amount ?? '--'
    }

    return currencyFormatter.format(numericValue)
  }

  return currencyFormatter.format(amount)
}

function formatDate(value) {
  if (!value) {
    return '--'
  }

  const timestamp = typeof value === 'number' ? value : Date.parse(value)

  if (Number.isNaN(timestamp)) {
    return value
  }

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp))
}

function InfoList({ title, items }) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      <div className="mt-4 space-y-3 text-sm text-slate-700">
        {items.map(({ key, label, value }) => (
          <div key={key ?? label} className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {label}
            </span>
            <span className="mt-1 font-medium text-slate-700">
              {value || '--'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

async function getPaymentDetails(orderId, trackingCode) {
  try {
    const response = await fetch(`${API_BASE_URL}/${orderId}/${trackingCode}`, {
      cache: 'no-store',
    })

    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const payload = isJson ? await response.json() : null

    if (!response.ok) {
      return {
        data: null,
        error:
          payload?.message ??
          'We were unable to fetch the payment details for this order.',
      }
    }

    if (!payload) {
      return {
        data: null,
        error: 'We received an unexpected response from the payment service.',
      }
    }

    if (!payload?.success) {
      return {
        data: null,
        error: payload?.message ?? 'This payment link is no longer available.',
      }
    }

    return {
      data: payload.data,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error:
        'Something went wrong while loading the payment details. Please try again later.',
    }
  }
}

export default async function PaymentLinkPage({ params, searchParams }) {
  const { orderId, trackingCode } = params
  const { data: paymentDetails, error: paymentError } = await getPaymentDetails(
    orderId,
    trackingCode,
  )

  const rawAlertType =
    typeof searchParams?.type === 'string'
      ? searchParams.type.toLowerCase()
      : null
  const normalizedAlertType = rawAlertType === 'sucess' ? 'success' : rawAlertType
  const alertType =
    normalizedAlertType && ['success', 'cancel'].includes(normalizedAlertType)
      ? normalizedAlertType
      : null

  if (!paymentDetails) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-rose-100 bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-semibold text-slate-900">
            Payment link unavailable
          </h1>
          <p className="mt-4 text-sm text-slate-600">
            {paymentError
              ? paymentError
              : 'We couldn&rsquo;t find payment details for this order. Please verify the link or contact the sender for assistance.'}
          </p>
        </div>
      </main>
    )
  }

  const {
    business,
    sender,
    recipients,
    paymentLinkUrl,
    fee,
    orderId: id,
    createdAt,
    created_at,
    trackingCode: code,
    paid,
  } = paymentDetails

  const createdDate = formatDate(createdAt ?? created_at)

  const businessName = business?.name ?? sender?.name ?? 'LegalDrop'

  const recipientList = Array.isArray(recipients) ? recipients : []

  const amountDue = formatCurrency(fee)

  const isPaid =
    typeof paid === 'string'
      ? paid.toLowerCase() === 'true'
      : Boolean(paid)
  const paymentStatusLabel = isPaid ? 'Paid' : 'Payment pending'
  const paymentStatusBadgeClass = isPaid
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : 'bg-amber-50 text-amber-700 ring-amber-200'

  const paymentProvider = paymentLinkUrl?.includes('stripe')
    ? 'Stripe'
    : 'LegalDrop'

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {alertType && <PaymentAlert type={alertType} />}
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-white">
            {business?.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt={`${businessName} logo`}
                fill
                className="object-cover"
                sizes="56px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-purple-700 text-lg font-semibold text-white">
                {businessName?.charAt(0)?.toUpperCase() ?? 'L'}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Order Payment
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">
              Pay for your order
            </h1>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                <span className="mr-1" role="img" aria-hidden>
                  📦
                </span>
                {businessName} has sent you an order for payment.
              </p>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    Order ID
                  </span>
                  <p className="mt-1 font-medium text-slate-900">
                    {id ?? '--'}
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    Tracking Code
                  </span>
                  <p className="mt-1 font-medium text-slate-900">
                    {code ?? trackingCode}
                  </p>
                </div>
              <div>
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Date Created
                </span>
                <p className="mt-1 font-medium text-slate-900">
                  {createdDate}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Payment Status
                </span>
                <span
                  className={`mt-1 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${paymentStatusBadgeClass}`}
                >
                  {paymentStatusLabel}
                </span>
              </div>
            </div>
          </div>
          {business && (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{business.name}</p>
                <p className="mt-2">{business.email}</p>
                {business.phone && <p className="mt-1">{business.phone}</p>}
                {business.address && <p className="mt-1">{business.address}</p>}
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoList
            title="Sender"
            items={
              sender
                ? [
                    { key: 'sender-name', label: 'Name', value: sender.name },
                    {
                      key: 'sender-email',
                      label: 'Email',
                      value: sender.email,
                    },
                    {
                      key: 'sender-phone',
                      label: 'Phone',
                      value: sender.phone,
                    },
                    {
                      key: 'sender-address',
                      label: 'Address',
                      value: sender.address,
                    },
                  ]
                : []
            }
          />
          <InfoList
            title={
              recipients && recipients.length > 1 ? 'Recipients' : 'Recipient'
            }
            items={
              recipientList.length
                ? recipientList.flatMap((recipient, index) => {
                    const suffix =
                      recipientList.length > 1 ? ` ${index + 1}` : ''

                    return [
                      {
                        key: `recipient-name-${index}`,
                        label: `Name${suffix}`,
                        value: recipient.name,
                      },
                      {
                        key: `recipient-email-${index}`,
                        label: `Email${suffix}`,
                        value: recipient.email,
                      },
                      {
                        key: `recipient-phone-${index}`,
                        label: `Phone${suffix}`,
                        value: recipient.phone,
                      },
                      {
                        key: `recipient-address-${index}`,
                        label: `Address${suffix}`,
                        value: recipient.address,
                      },
                    ]
                  })
                : []
            }
          />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Amount Due
          </p>
          <p className="mt-4 text-4xl font-bold text-slate-900">{amountDue}</p>
          <p className="mt-2 text-sm text-slate-500">
            Pay securely to complete this order.
          </p>
          {isPaid ? (
            <div className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-50 px-6 py-3 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
              Payment received. Thank you!
            </div>
          ) : paymentLinkUrl ? (
            <Link
              href={paymentLinkUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-purple-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-purple-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
            >
              Pay Now
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-6 py-3 text-base font-semibold text-slate-500"
            >
              Payment link unavailable
            </button>
          )}
        </section>

        <footer className="pt-4 text-center text-xs text-slate-500">
          Secure payments powered by {paymentProvider}.
        </footer>
      </div>
    </main>
  )
}
