// Four-step explainer, on the page's one purple band.
//
// THE BAND IS THE POINT. This section sits between two surface-tint bands —
// Services above, the medical VerticalSection below — and used to be a plain
// page-ground slot between them: a 4-point-lighter gap that read as an
// interruption rather than a beat. Purple here turns that gap into the middle
// of the page's punctuation, and gives the two tint bands a hard edge to meet.
//
// It is the ONLY purple section ground on the site. Everywhere else purple is a
// card sitting on a light section (BecomeADriver, the two FinalCta bands) or the
// header bar. That scarcity is what makes this land, so it is not a pattern to
// spread — one strong purple moment, not a purple page.
//
// Server component, and static. Nothing here animates, so there is nothing for
// prefers-reduced-motion to reduce.

const STEPS = [
  {
    number: '01',
    title: 'Enter pickup and dropoff',
    description: 'Two addresses is all we need to start.',
  },
  {
    number: '02',
    title: 'See your price',
    description: 'Flat, upfront, from $8.00. No surprises.',
  },
  {
    number: '03',
    title: 'Pay online',
    // DEVIATION: the design says "Card, Apple Pay, or monthly invoicing."
    // Monthly invoicing is a partner-platform billing arrangement, not
    // something a consumer can choose at checkout — offering it here would
    // promise a payment method this flow does not have.
    description: 'Card, Apple Pay, or Google Pay.',
  },
  {
    number: '04',
    title: 'Track live',
    description: 'Watch the driver and share a link.',
  },
]

export function HowItWorks() {
  return (
    // TWO ELEMENTS, GROUND OUTSIDE THE COLUMN. Same shape as home/Services.jsx
    // and home/VerticalSection.jsx, for the same reason: the purple runs the
    // full viewport while the content stays in the 1200px column, and those
    // cannot be the same element — `bg-brand-600` on the element that also
    // carries `mx-auto max-w-[1200px]` paints a purple rectangle with page-
    // coloured gutters either side.
    //
    // brand-600 is #7B2FBE, the brand colour. The config records white on it at
    // 7.0:1, which is what licenses white body text here and not just white
    // buttons. `text-white` on the section matches Header.jsx; the children
    // below still name their own colour rather than relying on it.
    <section className="bg-brand-600 text-white">
      <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
        <h2 className="font-display text-3xl font-extrabold text-white">
          How it works
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            // THE RULE SPLIT SURVIVED THE GROUND CHANGE, IN WHITE. It used to be
            // ink on step one and #e5e1e8 on the rest; both of those disappear
            // against #7B2FBE, taking the "you are at the start" signal with
            // them. Solid white marks step one, white/20 carries the other
            // three — the same white-alpha hairline HeaderMobileNav uses on this
            // exact ground. These are rules, not text, so no contrast minimum
            // applies to the 20%.
            <div
              key={step.number}
              className={`border-t-[3px] pt-[18px] ${
                index === 0 ? 'border-white' : 'border-white/20'
              }`}
            >
              {/* WHITE AT AN OPACITY, NOT A GREY. The greys these three rows
                  used (#8d8695, #17131c, #5f5868) are tuned for a light ground
                  and are unreadable or muddy on purple, so secondary text here
                  follows the FinalCta bands: inherited white, stepped down with
                  `opacity`.

                  MEASURED AGAINST #7B2FBE, all above the 4.5:1 floor:
                    title        white       7.02:1
                    description  opacity-85  5.51:1
                    number       opacity-75  4.64:1

                  75 ON THE NUMBER IS THE FLOOR, NOT A PREFERENCE. opacity-70
                  composites to #d7c1eb and measures 4.24:1 — it fails, at 14px,
                  on the smallest text in the band. 75 is the first step that
                  clears 4.5 and still leaves the numeral the quietest thing
                  here, which is the hierarchy the section wants: title, then
                  description, then the marker. Do not lower it. */}
              <div className="text-sm font-semibold tracking-label opacity-75">
                {step.number}
              </div>
              <div className="mt-2 text-lg font-bold text-white">
                {step.title}
              </div>
              <div className="mt-1.5 text-sm opacity-85">
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
