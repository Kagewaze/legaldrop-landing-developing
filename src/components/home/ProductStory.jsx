// Purpose-built product demonstrations for the homepage. These are compact,
// representative compositions rather than screenshots: each shows only the
// product concept needed for its step and uses the same visual frame.

const STAGES = [
  {
    number: '01',
    title: 'Request',
    sentence: 'Enter where the delivery starts and where it needs to go.',
    visual: 'request',
  },
  {
    number: '02',
    title: 'Track',
    sentence: 'Follow the delivery as its status changes along the way.',
    visual: 'track',
  },
  {
    number: '03',
    title: 'Record',
    sentence:
      'Keep the completed delivery details together after the job is done.',
    visual: 'record',
  },
]

function ProductCanvas({ label, children }) {
  return (
    <div
      data-stage-media
      role="img"
      aria-label={label}
      className="relative flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-[28px] border border-[#ddcbea] bg-[linear-gradient(145deg,#f4eafb_0%,#fbf8fd_54%,#eee0f8_100%)] p-5 shadow-[0_2px_4px_rgba(82,28,130,0.06),0_22px_54px_-24px_rgba(82,28,130,0.34)] sm:min-h-[420px] sm:p-8 lg:min-h-[460px] lg:p-10"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl"
      />
      <div aria-hidden="true" className="relative w-full max-w-[560px]">
        {children}
      </div>
    </div>
  )
}

function ProductBar({ title, status }) {
  return (
    <div className="flex items-center justify-between border-b border-[#eee5f4] px-5 py-4 sm:px-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#efe3f7] text-brand-700">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="6" cy="17" r="2" fill="currentColor" />
            <circle cx="18" cy="7" r="2" fill="currentColor" />
            <path d="M8 16c3-1 3-6 8-8" strokeDasharray="2 3" />
          </svg>
        </span>
        <span className="text-sm font-bold text-[#24152f]">{title}</span>
      </div>
      {status ? (
        <span className="rounded-full bg-[#f0e4f8] px-3 py-1 text-[10px] font-bold uppercase tracking-label text-brand-700">
          {status}
        </span>
      ) : null}
    </div>
  )
}

function RequestVisual() {
  return (
    <ProductCanvas label="A focused Druppr delivery request form">
      <div className="mx-auto overflow-hidden rounded-[20px] border border-[#e4d7ec] bg-white shadow-hero">
        <ProductBar title="New delivery" status="Quick request" />
        <div className="space-y-4 p-5 sm:p-7">
          {[
            ['A', 'Pickup', 'Enter pickup location'],
            ['B', 'Destination', 'Enter delivery destination'],
          ].map(([glyph, label, placeholder]) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-[14px] border border-[#e8ddf0] bg-[#fcfaff] px-4 py-3"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#eadcf5] text-xs font-bold text-brand-700">
                {glyph}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-label text-brand-700">
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#65596d]">
                  {placeholder}
                </p>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-[14px] border border-[#e8ddf0] px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-label text-[#796d81]">
                Vehicle
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#24152f]">Car</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2e8f9] text-brand-700">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M5 16h14l-1.4-5.2A2.5 2.5 0 0 0 15.2 9H8.8a2.5 2.5 0 0 0-2.4 1.8L5 16Z" />
                <path d="M4 16v2.5M20 16v2.5M7.5 16v1M16.5 16v1" />
              </svg>
            </span>
          </div>
          <div className="rounded-control bg-brand-600 px-5 py-3.5 text-center text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(123,47,190,0.8)]">
            Request delivery
          </div>
        </div>
      </div>
    </ProductCanvas>
  )
}

function TrackVisual() {
  const progress = ['Booked', 'Assigned', 'In progress', 'Delivered']

  return (
    <ProductCanvas label="An illustrative Druppr live delivery tracking view">
      <div className="overflow-hidden rounded-[20px] border border-[#d9c5e8] bg-white shadow-hero">
        <ProductBar title="Live delivery" status="In progress" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-label text-brand-700">
                Current status
              </p>
              <p className="mt-1 font-display text-xl font-extrabold text-[#24152f] sm:text-2xl">
                Driver is on the way
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-extrabold text-brand-700">
                18 min
              </p>
              <p className="text-xs font-semibold text-[#74677c]">7.4 km</p>
            </div>
          </div>

          <div aria-hidden="true" className="mt-5 grid grid-cols-4 px-1">
            {progress.map((label, index) => (
              <div key={label} className="relative flex flex-col items-center">
                {index > 0 ? (
                  <span
                    className={`absolute right-1/2 top-[6px] h-0.5 w-full ${
                      index <= 2 ? 'bg-brand-600' : 'bg-[#e2d7e9]'
                    }`}
                  />
                ) : null}
                <span
                  className={`relative z-10 h-3.5 w-3.5 rounded-full border-2 border-white ${
                    index <= 2
                      ? 'bg-brand-600 shadow-[0_0_0_3px_rgba(123,47,190,0.13)]'
                      : 'bg-[#c9bdcf] shadow-[0_0_0_3px_rgba(226,215,233,0.6)]'
                  }`}
                />
                <span
                  className={`mt-2 px-0.5 text-center text-[8px] font-bold leading-3 sm:text-[9px] ${
                    index <= 2 ? 'text-[#34213f]' : 'text-[#887a90]'
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="relative mt-5 h-[210px] overflow-hidden rounded-[16px] border border-[#d9d1df] bg-[#eeecf0] sm:h-[250px]">
            <svg
              viewBox="0 0 560 250"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full"
            >
              <rect width="560" height="250" fill="#efedf1" />

              {/* Quiet city blocks and parcels. */}
              <g fill="#e3e0e5" stroke="#dad6dd" strokeWidth="1">
                <rect x="18" y="14" width="104" height="48" rx="5" />
                <rect x="146" y="14" width="86" height="48" rx="5" />
                <rect x="256" y="14" width="112" height="48" rx="5" />
                <rect x="392" y="14" width="148" height="48" rx="5" />
                <rect x="18" y="88" width="72" height="54" rx="5" />
                <rect x="114" y="88" width="118" height="54" rx="5" />
                <rect x="256" y="88" width="76" height="54" rx="5" />
                <rect x="356" y="88" width="88" height="54" rx="5" />
                <rect x="468" y="88" width="72" height="54" rx="5" />
                <rect x="18" y="168" width="104" height="66" rx="5" />
                <rect x="146" y="168" width="86" height="66" rx="5" />
                <rect x="256" y="168" width="112" height="66" rx="5" />
                <rect x="392" y="168" width="148" height="66" rx="5" />
              </g>

              {/* Major and local streets: straight, connected city geometry. */}
              <g fill="none" strokeLinecap="square">
                <path d="M0 75H560" stroke="#ffffff" strokeWidth="18" />
                <path d="M0 155H560" stroke="#ffffff" strokeWidth="20" />
                <path d="M102 0V250" stroke="#ffffff" strokeWidth="16" />
                <path d="M244 0V250" stroke="#ffffff" strokeWidth="16" />
                <path d="M380 0V250" stroke="#ffffff" strokeWidth="18" />
                <path d="M456 0V250" stroke="#ffffff" strokeWidth="12" />
                <path
                  d="M0 75H560M0 155H560M102 0V250M244 0V250M380 0V250M456 0V250"
                  stroke="#d8d4dc"
                  strokeWidth="1"
                />
              </g>

              {/* A plausible courier route following the street grid. */}
              <path
                d="M150 213H102V155H244V75H380V44"
                fill="none"
                stroke="#ffffff"
                strokeWidth="10"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d="M150 213H102V155H244V75H380V44"
                fill="none"
                stroke="#7B2FBE"
                strokeWidth="5.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Pickup and destination context. */}
              <circle
                cx="150"
                cy="213"
                r="8"
                fill="#ffffff"
                stroke="#1c6742"
                strokeWidth="3"
              />
              <circle cx="150" cy="213" r="3" fill="#1c6742" />
              <circle
                cx="380"
                cy="44"
                r="10"
                fill="#281632"
                stroke="#ffffff"
                strokeWidth="3"
              />
              <text
                x="380"
                y="47.5"
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#ffffff"
              >
                B
              </text>

              {/* Small directional vehicle marker, matching the live tracker. */}
              <g transform="translate(304 75) rotate(90)">
                <circle
                  cx="0"
                  cy="0"
                  r="16"
                  fill="#ffffff"
                  stroke="#7B2FBE"
                  strokeWidth="2"
                />
                <path d="M0-10 4-4h-8l4-6Z" fill="#7B2FBE" />
                <rect
                  x="-4"
                  y="-4"
                  width="8"
                  height="11"
                  rx="2"
                  fill="#7B2FBE"
                />
                <rect
                  x="-3"
                  y="-2"
                  width="6"
                  height="3"
                  rx="1"
                  fill="#ffffff"
                />
              </g>
            </svg>

            <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#d6c1e5] bg-white text-brand-700 shadow-card">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </ProductCanvas>
  )
}

function RecordVisual() {
  return (
    <ProductCanvas label="A completed Druppr delivery record">
      <div className="mx-auto overflow-hidden rounded-[20px] border border-[#e0d1eb] bg-white shadow-hero">
        <ProductBar title="Delivery record" status="Delivered" />
        <div className="p-5 sm:p-7">
          <div className="flex items-center gap-4 rounded-[16px] border border-[#dcecdf] bg-[#f3faf5] p-4">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#dcefe2] text-[#1c6742]">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="m6 12 4 4 8-9" />
              </svg>
            </span>
            <div>
              <p className="font-display text-lg font-extrabold text-[#204d35]">
                Delivery completed
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#557061]">
                The completed job remains available here.
              </p>
            </div>
          </div>
          <dl className="mt-5 divide-y divide-[#eee7f2] rounded-[16px] border border-[#e8ddf0] px-4">
            {[
              ['Tracking code', 'DRP ••••'],
              ['Category', 'Package delivery'],
              ['Vehicle', 'Car'],
              ['Order placed', 'Today, 9:42 AM'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-6 py-3.5"
              >
                <dt className="text-[11px] font-bold uppercase tracking-label text-[#82758a]">
                  {label}
                </dt>
                <dd className="text-right text-sm font-bold text-[#2d2133]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex items-center gap-3 text-xs font-bold text-brand-700">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-600 ring-4 ring-[#eee3f6]" />
            Timestamped delivery history
          </div>
        </div>
      </div>
    </ProductCanvas>
  )
}

function StageVisual({ visual }) {
  if (visual === 'request') return <RequestVisual />
  if (visual === 'track') return <TrackVisual />
  return <RecordVisual />
}

function Stage({ stage, index }) {
  const reversed = index % 2 === 1
  return (
    <article
      className={`mx-auto grid w-full max-w-[1400px] items-center gap-8 px-5 sm:px-8 lg:gap-14 xl:gap-20 ${reversed ? 'lg:grid-cols-[minmax(0,0.64fr)_minmax(0,0.36fr)] lg:[&>*:first-child]:order-2' : 'lg:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)]'}`}
    >
      <div data-motion-copy className="max-w-[390px]">
        <div data-motion-label className="flex items-center gap-3">
          <span className="font-display text-sm font-extrabold tracking-label text-brand-600">
            {stage.number}
          </span>
          <span aria-hidden="true" className="h-px w-12 bg-brand-600/35" />
        </div>
        <h3 className="mt-3 font-display text-3xl font-extrabold text-[#24152f]">
          {stage.title}
        </h3>
        <p className="mt-3 text-base text-[#62566a] sm:text-lg">
          {stage.sentence}
        </p>
      </div>
      <StageVisual visual={stage.visual} />
    </article>
  )
}

export function ProductStory() {
  return (
    <section
      aria-labelledby="product-story"
      className="overflow-clip bg-[linear-gradient(180deg,#fbf9f8_0%,#f8f2fc_48%,#fbf9f8_100%)]"
    >
      <div className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8 sm:pt-20 lg:pt-24">
        <div data-motion-copy className="max-w-[680px]">
          <span className="text-xs font-bold uppercase tracking-label text-brand-700">
            Product demonstration
          </span>
          <h2
            id="product-story"
            className="mt-3 font-display text-3xl font-extrabold text-[#24152f] sm:text-4xl"
          >
            See the delivery journey
          </h2>
          <p className="mt-4 text-lg text-[#62566a]">
            Request a delivery, follow its progress and keep the record when
            it&rsquo;s done.
          </p>
        </div>
      </div>
      <div className="mt-10 flex flex-col gap-14 pb-20 sm:mt-14 sm:gap-16 lg:gap-20 lg:pb-28">
        {STAGES.map((stage, index) => (
          <Stage key={stage.number} stage={stage} index={index} />
        ))}
      </div>
    </section>
  )
}
