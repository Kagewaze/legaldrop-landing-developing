'use client'

const money = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
})

export function formatMoney(value) {
  return money.format(Number(value) || 0)
}

// Itemised fare panel.
//
// NO TAX LINE. The design shows "HST (13%)", but quote-itemized returns no tax
// field, and the business's GST/HST registration status is unconfirmed.
// Computing 13% client-side would put a fabricated tax figure on a payment
// screen — that is a number a customer could be shown, act on, and later
// dispute. It stays out until the backend returns one.
//
// platformFee is ALREADY INCLUDED in `total`. It is listed as its own row for
// transparency but must never be added on top.

export function PriceBreakdown({ quote, vehicleName, packageCount, weightLabel }) {
  const { lineItems, platformFee, total, distanceKm } = quote

  const rows = [
    { key: 'base', label: 'Base fare', value: lineItems.base },
    {
      key: 'distance',
      label:
        distanceKm != null
          ? `Distance · ${distanceKm.toFixed(1)} km`
          : 'Distance',
      value: lineItems.distance,
    },
    {
      key: 'extraPackage',
      label:
        packageCount > 1
          ? `Extra packages · ${packageCount - 1}`
          : 'Extra packages',
      value: lineItems.extraPackage,
    },
    // The design omits these two entirely, which is why its numbers do not sum.
    { key: 'labour', label: 'Labour', value: lineItems.labour },
    { key: 'heavyFee', label: 'Heavy item', value: lineItems.heavyFee },
    { key: 'platformFee', label: 'Platform fee', value: platformFee },
  ].filter((row) => row.value > 0)

  // Integrity check. If the parts do not add up to the total, our understanding
  // of the response shape is wrong — show the total alone rather than an
  // itemisation that visibly fails to sum. A breakdown that does not add up
  // reads as a billing error and invites a dispute.
  const sum = rows.reduce((acc, row) => acc + row.value, 0)
  const itemsReconcile = Math.abs(sum - total) < 0.01

  return (
    <div className="flex flex-col">
      <div className="text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
        FARE ESTIMATE
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <div className="text-[40px] font-extrabold tracking-[-0.03em] text-brand-600">
          {formatMoney(total)}
        </div>
        <div className="text-[14px] font-bold text-[#8d8695]">CAD</div>
      </div>

      <div className="mt-2 text-[14px] text-[#5f5868]">
        {[vehicleName, `${packageCount} ${packageCount === 1 ? 'package' : 'packages'}`, weightLabel]
          .filter(Boolean)
          .join(' · ')}
      </div>

      {itemsReconcile ? (
        <div className="mt-5 flex flex-col gap-2.5 text-[14px]">
          {rows.map((row) => (
            <div key={row.key} className="flex justify-between gap-4">
              <span className="text-[#5f5868]">{row.label}</span>
              <span className="font-bold text-[#17131c]">
                {formatMoney(row.value)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-[13px] text-[#5f5868]">
          Itemised breakdown unavailable for this quote.
        </p>
      )}

      <div className="mt-4 flex items-baseline justify-between border-t-[1.5px] border-[#e8e0f0] pt-4">
        <span className="text-[15px] font-extrabold text-[#17131c]">Total</span>
        <span className="text-[20px] font-extrabold tracking-[-0.02em] text-[#17131c]">
          {formatMoney(total)}
        </span>
      </div>
    </div>
  )
}
