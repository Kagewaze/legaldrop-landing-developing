// A four-card value grid.
//
// Prop-driven so the marketing pages (/medical, /legal) can reuse the styling
// with their own audience's reasons. It holds no content of its own — a caller
// that passes nothing renders nothing, rather than silently falling back to the
// home page's copy on a page where that copy would be wrong.
//
// The home page's own content lives below as HOME_REASONS and is passed in
// explicitly, so this component has no privileged caller.

export const HOME_REASONS = [
  {
    title: 'Same-day delivery',
    description: 'Most jobs collected within the hour.',
    icon: <span className="h-[14px] w-[14px] rounded-full border-2 border-white" />,
  },
  {
    title: 'Live tracking',
    description: 'A map link for you and your recipient.',
    icon: <span className="h-[4px] w-[14px] rounded-[2px] bg-white" />,
  },
  {
    title: 'TDG-certified drivers',
    description: 'Trained for medical and regulated goods.',
    icon: <span className="h-[12px] w-[12px] rotate-45 bg-white" />,
  },
  {
    // CORRECTED. This card read "Signature on delivery — Proof and photo on
    // every drop-off." Neither is true: the flow confirms a handover with a
    // drop-off code, and it captures no photo. It was the same claim the
    // medical and legal pages are written to avoid, sitting on the site's
    // highest-traffic page. Describe the confirmation that actually exists.
    title: 'Confirmed delivery',
    description: 'Confirmed by drop-off code and tracked live.',
    icon: (
      <span className="mb-[3px] h-[10px] w-[14px] border-b-2 border-l-2 border-white" />
    ),
  },
]

export function WhyBrand({ heading, reasons }) {
  // Three cards in a four-column grid leave a dead column that reads as a
  // missing card, so the track count follows the content. Four reasons — the
  // home page — resolve to lg:grid-cols-4, exactly as before.
  const columns = reasons.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'

  return (
    <section className="mx-auto max-w-[1200px] px-8 pt-16">
      <h2 className="text-3xl font-extrabold text-[#17131c]">{heading}</h2>

      <div className={`mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 ${columns}`}>
        {reasons.map((reason) => (
          <div key={reason.title} className="rounded-card bg-[#faf7fd] p-6 shadow-card">
            <div className="flex h-9 w-9 items-center justify-center rounded-tile bg-brand-600">
              {reason.icon}
            </div>
            <div className="mt-4 text-lg font-bold text-[#17131c]">
              {reason.title}
            </div>
            <div className="mt-1.5 text-sm text-[#5f5868]">
              {reason.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
