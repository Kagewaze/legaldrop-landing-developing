import Link from 'next/link'

import { BRAND } from '@/lib/config'

// Shared presentation for the two tracking surfaces.
//
// Both /track/[trackingCode] and /track-partner/[trackingToken] rendered the
// same header and the same detail list from two copies of the same markup. The
// copies had already drifted, so this holds the one definition. PRESENTATION
// ONLY — no data, no fetching, no status logic. The two routes stay separate
// pages with separate payloads; nothing here merges public and partner data.
//
// The design follows the site's tokens rather than the slate palette these
// pages used to carry: surface.page ground, surface.raised cards, #eeebf1
// hairlines, rounded-card, shadow-card, #17131c ink and #5f5868 secondary.

// ⚠️ THE HEADER USED TO BE A PURPLE CIRCLE CONTAINING THE LETTER "L".
//
// That was LegalDrop's mark on a product now called Druppr, and it was the
// first thing a customer saw after clicking a tracking link. The real current
// brand mark is the wordmark the site header itself renders — BRAND.name — so
// this uses that. No new logo was invented and no image asset was added.
export function TrackingHeader({ eyebrow, title }) {
  return (
    <header className="flex flex-col items-center gap-5 text-center">
      <Link
        href="/"
        className="text-2xl font-bold text-[#17131c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page"
      >
        {BRAND.name}
      </Link>
      <div>
        <p className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.02em] text-[#17131c] sm:text-4xl">
          {title}
        </h1>
      </div>
    </header>
  )
}

// A labelled detail card. Values are rendered exactly as passed — this does no
// formatting of its own, so the two routes keep control of what they expose.
//
// `footer` is optional and is where the completion marker lands.
export function InfoList({ title, items, footer = null, className = '' }) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <section
      className={`rounded-card border border-[#eeebf1] bg-surface-raised p-6 shadow-card ${className}`}
    >
      <h2 className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
        {title}
      </h2>
      <dl className="mt-5 space-y-4">
        {items.map(({ key, label, value }) => (
          <div key={key ?? label}>
            <dt className="text-[11px] font-semibold uppercase tracking-label text-[#8d8695]">
              {label}
            </dt>
            <dd className="mt-1 text-[15px] font-semibold text-[#17131c]">
              {value || '--'}
            </dd>
          </div>
        ))}
      </dl>
      {footer}
    </section>
  )
}

// The completion marker: the record card says on its own face that the job
// finished, instead of relying on the status panel sitting above it.
//
// ⚠️ TRUTHFUL AND CONDITIONAL. It is rendered only where the caller has already
// established that the real status is the terminal delivered value — it invents
// no status of its own and adds no claim beyond the word the product already
// uses. It sits at the END of the record because the record reads
// chronologically and this is the last thing that happened.
//
// Styling comes from statusPillClass('delivered') so there is exactly one
// Delivered treatment in the product.
export function CompletionMarker() {
  return (
    <div className="mt-5 flex items-center gap-3 border-t border-[#f2eff5] pt-5">
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-label ring-1 ring-inset ${statusPillClass(
          'delivered',
        )}`}
      >
        Delivered
      </span>
    </div>
  )
}

// Status colour. Restrained on purpose: a tracking page is not a dashboard, and
// three saturated pill colours were doing more shouting than informing. The
// status WORD is always rendered beside the colour, so nothing here carries
// meaning by hue alone. Every pairing clears 4.5:1.
export function statusPillClass(status) {
  if (status === 'delivered') {
    return 'bg-[#eef7f1] text-[#1c6742] ring-[#cfe7db]'
  }

  if (['cancelled', 'failed', 'refunded'].includes(status)) {
    return 'bg-[#fdf0f1] text-[#96293a] ring-[#f2d2d7]'
  }

  return 'bg-surface-tint text-brand-700 ring-[#e6dcf3]'
}

// A quiet surface for the tracking cards to sit on.
export function TrackingShell({ children }) {
  return (
    <main className="min-h-screen bg-surface-page px-5 py-12 sm:py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        {children}
      </div>
    </main>
  )
}
