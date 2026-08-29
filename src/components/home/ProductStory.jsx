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
          <div aria-hidden="true" className="mt-5 grid grid-cols-4 gap-1.5">
            <span className="h-1.5 rounded-full bg-brand-600" />
            <span className="h-1.5 rounded-full bg-brand-600" />
            <span className="h-1.5 rounded-full bg-brand-500" />
            <span className="h-1.5 rounded-full bg-[#e2d6ea]" />
          </div>
          <div className="relative mt-5 h-[190px] overflow-hidden rounded-[16px] border border-[#decfe9] bg-[#eee7f3] sm:h-[230px]">
            <svg
              viewBox="0 0 560 230"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <rect width="560" height="230" fill="#f1ebf5" />
              <path
                d="M-30 55C80 90 120 18 235 54s170 82 355 32"
                fill="none"
                stroke="#fff"
                strokeWidth="18"
              />
              <path
                d="M70 250c34-88 89-97 149-122s112-29 175-148"
                fill="none"
                stroke="#fff"
                strokeWidth="14"
              />
              <path
                d="M-30 170c135-25 213 7 320-28s164-27 300 24"
                fill="none"
                stroke="#e2d8e9"
                strokeWidth="3"
              />
              <path
                d="M112 202C174 156 212 150 272 128s104-56 170-93"
                fill="none"
                stroke="#7B2FBE"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="2 10"
              />
            </svg>
            <span className="absolute left-[18%] top-[72%] h-4 w-4 rounded-full border-[3px] border-white bg-brand-600 shadow-md" />
            <span className="absolute right-[18%] top-[14%] flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-[#24152f] text-[10px] font-bold text-white shadow-md">
              B
            </span>
            <span className="absolute left-[52%] top-[43%] flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-brand-600 text-white shadow-[0_10px_24px_-8px_rgba(82,28,130,0.75)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                <path d="m12 3 4.5 7H15v7.5a3 3 0 0 1-6 0V10H7.5L12 3Z" />
              </svg>
            </span>
            <span className="absolute bottom-3 left-3 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-label text-brand-700 shadow-card">
              Tracking preview
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
      <div className="max-w-[390px]">
        <div className="flex items-center gap-3">
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
      className="overflow-hidden bg-[linear-gradient(180deg,#fbf9f8_0%,#f8f2fc_48%,#fbf9f8_100%)]"
    >
      <div className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8 sm:pt-20 lg:pt-24">
        <div className="max-w-[680px]">
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
