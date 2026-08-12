// The connected-logistics system — the product shown as one network rather than
// as three stacked cards.
//
// SERVER COMPONENT, ZERO CLIENT JAVASCRIPT. Everything below is JSX, CSS and a
// little inline SVG. The float and the connector pulse are CSS keyframes in
// src/styles/tailwind.css; nothing here mounts, measures or schedules.
//
// ⚠️ REPLACES home/PlatformShowcase.jsx, which is retained on disk and
// unimported as the rollback target — restoring it is a two-line change in
// src/app/(main)/page.jsx. Same convention as home/Services.jsx and
// home/HowItWorks.jsx before it.
//
// ── EVERY FRAGMENT IS DERIVED FROM SOMETHING REAL ───────────────────────────
//
// The miniatures inside the modules are abstractions of surfaces this product
// actually has. Nothing depicts a feature that does not ship:
//
//   REQUEST   two address fields and a vehicle chip — the shape of
//             components/home/HeroAddressEntry.jsx, vehicle names from
//             components/send/vehicles.js
//   DISPATCH  a status chip carrying a real TaskStatusType value, with a
//             category from send/page.jsx SECTION_PRESETS
//   TRACK     a route line and marker, the same geometry PlatformShowcase drew,
//             with a real in-flight status
//   RECORD    three timestamps, all of which the tracking surfaces render:
//             createdAt, packagePickedUp, and a status reaching `delivered`
//
// ⚠️ WHAT IS DELIBERATELY ABSENT, AND MUST STAY ABSENT. No business portal —
// /track-partner is a tracking page, not a dashboard, so there is no order
// list, no login and no filters to depict. No integrations, analytics, route
// optimisation, AI dispatch, SLA, scheduling, invoicing or cold-chain module.
// No chain-of-custody framing: these are timestamps and they are called
// timestamps.
//
// ── NO NEW CLAIMS ───────────────────────────────────────────────────────────
//
// This is a system visualisation, not a marketing-claims surface. The only
// prose is the heading and one sentence. Do not add feature bullets, coverage
// statements, percentages or time promises beneath it.

// Statuses are real values from the backend's TaskStatusType, documented in
// src/app/track/[trackingCode]/LiveTracking.jsx:14-23, and title-cased exactly
// as the product renders them.
const DISPATCH_STATUS = 'Assigned'
const TRACK_STATUS = 'Ongoing'

// How the product actually displays an assigned driver: FIRST INITIAL ONLY plus
// the vehicle type — src/app/track-partner/[trackingToken]/page.jsx:154,287. The
// product never shows a driver's full name, so neither does this.
//
// ⚠️ This replaced a 'Medical supply' category line. Dispatch is one of the four
// GENERIC workflow nodes; a medical category here biased a neutral step toward
// one vertical, and Medical already has its own module. SECTION_PRESETS carries
// 'other' as the general default (src/lib/send-flow.js:36) but ships no label
// string for it, so rather than invent one this shows the assignment itself —
// which is what Dispatch actually means.
const DISPATCH_DRIVER_INITIAL = 'A'
const DISPATCH_DRIVER_VEHICLE = 'Car'

// From components/send/vehicles.js.
const REQUEST_VEHICLE = 'Car'

// Three timestamps, down from four: the module exists so a persistent delivery
// record is RECOGNISABLE, not so anyone can read an audit log. Dropping the
// 'Assigned' row removes the densest line without losing the beginning-middle-end
// shape, and Assigned is already carried by the Dispatch module beside it.
//
// All three are fields the tracking surfaces render — createdAt,
// packagePickedUp, and a status reaching `delivered`. Times are synthetic.
const RECORD_ROWS = [
  ['Requested', '9:02'],
  ['Picked up', '9:34'],
  ['Delivered', '10:07'],
]

// ── SHAPE ───────────────────────────────────────────────────────────────────
//
// A chamfered hexagonal silhouette rather than a mathematically flat hexagon:
// flat vertical sides give the fragments a full-width band to sit in, where a
// pointy-sided hexagon would pinch them. 22%/78% is a softer chamfer than a
// true 25%/75% hexagon and reads as a machined module rather than a honeycomb
// cell.
const HEX_CLIP = 'polygon(50% 0%, 100% 22%, 100% 78%, 50% 100%, 0% 78%, 0% 22%)'

// ⚠️ THE BORDER IS A NESTED SHAPE, NOT A `border`. A clipped element has its
// border clipped away with everything else, so the hairline is produced by
// stacking two clipped boxes: the outer one is the border colour, the inner is
// inset by 1px and carries the face. Same trick for the shadow — `box-shadow`
// is clipped too, so elevation comes from `filter: drop-shadow()` on an
// unclipped wrapper, which follows the silhouette.
function Hex({ children, className = '', style, tone = 'primary' }) {
  const face =
    tone === 'centre'
      ? 'bg-gradient-to-b from-white to-[#faf7fd]'
      : 'bg-surface-raised'

  return (
    <div
      data-system-module
      className={`relative aspect-square ${className}`}
      style={style}
    >
      {/* Elevation lives here, outside the clip. Two layers: a wide soft
          ambient and a tight contact shadow, the same two-part model as the
          shadow-* ramp — expressed as drop-shadow because the ramp's
          box-shadows cannot survive clip-path. */}
      <div className="h-full w-full [filter:drop-shadow(0_10px_22px_rgba(23,19,28,0.07))_drop-shadow(0_1px_1px_rgba(23,19,28,0.06))]">
        {/* Outer = hairline colour. */}
        <div
          className="h-full w-full bg-[#e7e2ec]"
          style={{ clipPath: HEX_CLIP }}
        >
          {/* Inner = the face, inset by 1px, producing the hairline. */}
          <div
            className={`flex h-full w-full flex-col items-center justify-center ${face}`}
            style={{ clipPath: HEX_CLIP, transform: 'scale(0.992)' }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Module label. 12px is the scale's floor and #5f5868 measures 6.5:1 on the
// white face — the same pairing every caption on this page uses.
function Label({ children }) {
  return (
    <span className="mt-2 text-[11px] font-semibold uppercase tracking-label text-[#5f5868] sm:text-xs">
      {children}
    </span>
  )
}

// A miniature field row — the shape of the booking form's inputs.
function MiniField({ marker }) {
  return (
    <span className="flex w-full items-center gap-1.5 rounded-[3px] border border-[#e3dfe8] px-1.5 py-1">
      {marker}
      <span className="h-[3px] flex-1 rounded-full bg-[#e3dfe8]" />
    </span>
  )
}

function Chip({ children, tone = 'brand' }) {
  return (
    <span
      className={`rounded-full px-1.5 py-[2px] text-[9px] font-semibold leading-none ${
        tone === 'brand'
          ? 'bg-brand-600 text-white'
          : 'bg-surface-tint text-[#5f5868]'
      }`}
    >
      {children}
    </span>
  )
}

export function ConnectedSystem() {
  return (
    // THE ONE TINTED BAND in the page's central rhythm. Phase 1 collapsed the
    // ground changes from seven to three; this is the middle one, and the white
    // modules need it — on surface.page they would sit on a ground only four
    // points away and the hairline would be doing all the work.
    <section aria-labelledby="connected-system" className="bg-surface-tint">
      <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24 lg:py-28">
        {/* The copy column is deliberately narrow. The system gets the space. */}
        <div className="max-w-[560px]">
          {/* ONE honesty marker, not two. This carried a 'Sample data' chip
              beside it as well; two disclosures on one line read as an internal
              QA screen rather than as a product demonstration. The disclosure
              stays — it is a condition of showing a simulated system — and the
              screen-reader summary repeats it for anyone who cannot see it. */}
          <span className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
            Product demonstration
          </span>

          <h2
            id="connected-system"
            className="mt-3 font-display text-3xl font-extrabold text-[#17131c] sm:text-4xl"
          >
            From request to recorded delivery
          </h2>

          {/* ONE SENTENCE. The previous section carried a two-sentence
              paragraph here and then repeated itself inside three dense cards.
              Do not add a second sentence, and do not add bullets below the
              system — the visual carries the rest. */}
          <p className="mt-3 text-lg text-[#5f5868]">
            One connected system from request to proof of delivery.
          </p>
        </div>

        {/* ── THE CLUSTER ────────────────────────────────────────────────────
            ONE DOM TREE, TWO COMPOSITIONS. Below lg the modules are a centred
            flex column in reading order. From lg they become absolutely
            positioned inside a fixed-ratio box, which is what lets the layout
            be genuinely asymmetric without a second copy of the markup.

            The lg box carries an explicit aspect-ratio so its height is known
            before paint — absolutely positioned children contribute nothing to
            layout, so without it the container would collapse and the section
            would shift. This is why CLS stays at zero.

            aria-hidden on the whole cluster: a screen reader traversing seven
            decorative miniatures learns nothing. The equivalent is one sentence
            below, which is the same approach NetworkDemo.jsx already takes. */}
        <div
          aria-hidden="true"
          className="mt-10 grid grid-cols-2 items-center justify-items-center gap-x-4 gap-y-5 sm:mt-14 sm:gap-x-8 sm:gap-y-7 lg:relative lg:mt-10 lg:block lg:aspect-[1000/520]"
        >
          {/* CONNECTORS. Desktop only — stacked modules on mobile need no
              network drawn between them, and a line between two vertically
              adjacent hexagons says nothing.

              The viewBox matches the container ratio exactly, so these
              coordinates and the percentage offsets below share one space. */}
          <svg
            viewBox="0 0 1000 520"
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            aria-hidden="true"
            focusable="false"
          >
            {/* Static base network — the system reads as complete with no
                animation at all. */}
            <g
              fill="none"
              stroke="#7B2FBE"
              strokeOpacity="0.16"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M 208 218 C 300 232, 330 268, 388 288" />
              <path d="M 465 176 C 465 210, 470 226, 472 246" />
              <path d="M 578 268 C 660 244, 720 190, 782 172" />
              <path d="M 552 340 C 596 366, 626 388, 652 404" />
              <path d="M 288 402 C 350 386, 392 350, 420 318" />
              <path d="M 848 372 C 780 356, 690 330, 596 306" />
            </g>

            {/* The travelling pulse. A short dash moving along the two spine
                paths — request into the hub, hub down to the record. Decorative
                only; the base network above is always drawn. */}
            <g
              fill="none"
              stroke="#7B2FBE"
              strokeOpacity="0.5"
              strokeWidth="2"
              strokeLinecap="round"
              pathLength="1"
            >
              <path
                data-system-pulse
                d="M 208 218 C 300 232, 330 268, 388 288"
                pathLength="1"
              />
              <path
                data-system-pulse
                style={{ animationDelay: '-3.5s' }}
                d="M 552 340 C 596 366, 626 388, 652 404"
                pathLength="1"
              />
            </g>

            {/* Route nodes at the two ends of the spine. */}
            <circle cx="208" cy="218" r="3.5" fill="#7B2FBE" fillOpacity="0.45" />
            <circle cx="652" cy="404" r="3.5" fill="#7B2FBE" fillOpacity="0.45" />
          </svg>

          {/* ── DRUPPR — the hub. Largest, and the only module with a tinted
              face, so the centre reads as the system rather than as a seventh
              peer. */}
          <Hex
            tone="centre"
            className="col-span-2 w-[52%] max-w-[172px] lg:absolute lg:left-[36%] lg:top-[34%] lg:w-[22.5%] lg:max-w-none"
            style={{ animationDuration: '19s' }}
          >
            {/* A soft lavender core so the connectors converge into light
                rather than into another flat card face. Sits behind the
                wordmark, contributes nothing to layout. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 [background:radial-gradient(58%_46%_at_50%_52%,rgba(123,47,190,0.10)_0%,rgba(123,47,190,0.04)_45%,rgba(123,47,190,0)_75%)]"
            />
            <span className="relative font-display text-xl font-extrabold tracking-[-0.025em] text-[#17131c] sm:text-2xl">
              Druppr
            </span>
            <span className="relative mt-1.5 h-[3px] w-8 rounded-full bg-brand-600" />
          </Hex>

          {/* ── REQUEST ── two address fields and a vehicle chip. */}
          <Hex
            className="w-full max-w-[168px] lg:absolute lg:left-[4%] lg:top-[20%] lg:w-[17%] lg:max-w-none"
            style={{ animationDuration: '15s', animationDelay: '-2s' }}
          >
            <span className="flex w-[58%] flex-col gap-1">
              <MiniField
                marker={
                  <span className="h-[5px] w-[5px] flex-none rounded-full border-[1.5px] border-brand-600" />
                }
              />
              <MiniField
                marker={
                  <span className="h-[5px] w-[5px] flex-none bg-brand-600" />
                }
              />
            </span>
            <span className="mt-1.5">
              <Chip tone="quiet">{REQUEST_VEHICLE}</Chip>
            </span>
            <Label>Request</Label>
          </Hex>

          {/* ── DISPATCH ── a real status value on a real category. */}
          <Hex
            className="w-full max-w-[168px] lg:absolute lg:left-[38%] lg:top-[0%] lg:w-[17%] lg:max-w-none"
            style={{ animationDuration: '17s', animationDelay: '-6s' }}
          >
            <Chip>{DISPATCH_STATUS}</Chip>
            {/* Driver initial + vehicle — the product's own display convention.
                Never a full name. */}
            <span className="mt-2 flex items-center gap-1">
              <span className="flex h-[13px] w-[13px] items-center justify-center rounded-full bg-surface-tint text-[7px] font-bold text-[#17131c]">
                {DISPATCH_DRIVER_INITIAL}
              </span>
              <span className="text-[9px] font-semibold text-[#5f5868]">
                {DISPATCH_DRIVER_VEHICLE}
              </span>
            </span>
            <Label>Dispatch</Label>
          </Hex>

          {/* ── TRACK ── the route geometry, carried over from the frame this
              section replaces. */}
          <Hex
            className="w-full max-w-[168px] lg:absolute lg:left-[78%] lg:top-[10%] lg:w-[17%] lg:max-w-none"
            style={{ animationDuration: '16s', animationDelay: '-9s' }}
          >
            <svg viewBox="0 0 64 30" className="w-[58%]" aria-hidden="true">
              <path
                d="M 6 24 C 22 24, 26 8, 58 6"
                fill="none"
                stroke="#e3dfe8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 6 24 C 22 24, 26 8, 58 6"
                fill="none"
                stroke="#8E43D0"
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="0.45"
              />
              <circle cx="6" cy="24" r="3" fill="#17131c" />
              <circle cx="33" cy="13" r="4.5" fill="#7B2FBE" />
              <circle cx="33" cy="13" r="1.8" fill="#ffffff" />
            </svg>
            <span className="mt-1.5">
              <Chip>{TRACK_STATUS}</Chip>
            </span>
            <Label>Track</Label>
          </Hex>

          {/* ── RECORD ── three timestamps, named as timestamps. */}
          <Hex
            className="w-full max-w-[168px] lg:absolute lg:left-[58%] lg:top-[62%] lg:w-[17%] lg:max-w-none"
            style={{ animationDuration: '18s', animationDelay: '-12s' }}
          >
            <span className="flex w-[64%] flex-col gap-[3px]">
              {RECORD_ROWS.map(([label, time], i) => (
                <span
                  key={label}
                  className="flex items-center justify-between gap-1.5 text-[8px] leading-none"
                >
                  <span className="flex items-center gap-1">
                    <span
                      className={`h-[3px] w-[3px] flex-none rounded-full ${
                        i === RECORD_ROWS.length - 1
                          ? 'bg-brand-600'
                          : 'bg-[#c9c3d1]'
                      }`}
                    />
                    <span className="font-semibold text-[#17131c]">{label}</span>
                  </span>
                  <span className="tabular-nums text-[#5f5868]">{time}</span>
                </span>
              ))}
            </span>
            <Label>Record</Label>
          </Hex>

          {/* ── MEDICAL / LEGAL ── deliberately quieter: roughly half the
              primaries' scale, no status chip, no product fragment. Category
              recognition only. The dedicated vertical sections follow directly
              below and carry the actual copy.

              ⚠️ NO COMPLIANCE CLAIMS HERE. No PHIPA, no HIPAA, no cold chain,
              no temperature control, no certified custody. Those gates are
              unmet and the vertical sections are careful about exactly this. */}
          <Hex
            className="hidden lg:absolute lg:left-[16%] lg:top-[70%] lg:block lg:w-[11.5%] lg:max-w-none"
            style={{ animationDuration: '21s', animationDelay: '-5s' }}
          >
            <span
              className="flex h-6 w-[17px] flex-col items-center rounded-[3px] border-[1.5px] border-[#c9c3d1] bg-white pt-[3px]"
              aria-hidden="true"
            >
              <span className="h-[2px] w-2.5 rounded-full bg-[#c9c3d1]" />
              <span className="mt-[3px] h-2.5 w-[5px] rounded-[1px] bg-brand-600/55" />
            </span>
            <Label>Medical</Label>
          </Hex>

          <Hex
            className="hidden lg:absolute lg:left-[80%] lg:top-[60%] lg:block lg:w-[11.5%] lg:max-w-none"
            style={{ animationDuration: '20s', animationDelay: '-14s' }}
          >
            <span
              className="flex h-6 w-[19px] flex-col justify-center gap-[3px] rounded-[3px] border-[1.5px] border-[#c9c3d1] bg-white px-1"
              aria-hidden="true"
            >
              <span className="h-[2px] w-full rounded-full bg-[#c9c3d1]" />
              <span className="h-[2px] w-full rounded-full bg-[#c9c3d1]" />
              <span className="h-[2px] w-2/3 rounded-full bg-brand-600/55" />
            </span>
            <Label>Legal</Label>
          </Hex>
        </div>

        {/* THE ACCESSIBLE EQUIVALENT. One sentence, announced once, rather than
            seven decorative fragments a screen reader would have to walk. */}
        <p className="sr-only">
          Druppr connects delivery requests, dispatch, live tracking and delivery
          records in one system, with medical and legal delivery handled on the
          same platform. This is an illustration using sample data.
        </p>
      </div>
    </section>
  )
}
