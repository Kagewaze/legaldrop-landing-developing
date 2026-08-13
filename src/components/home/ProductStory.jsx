import Image from 'next/image'

import recordShot from '../../../public/images/product-story/record.webp'
import requestShot from '../../../public/images/product-story/request.webp'
import trackShot from '../../../public/images/product-story/track.webp'

// The homepage product story: three real Druppr screens, in order.
//
// SERVER COMPONENT, ZERO CLIENT JAVASCRIPT. Static images and CSS. The section
// mounts nothing, fetches nothing and animates nothing, so the homepage island
// count is unchanged.
//
// ⚠️ REPLACES home/ConnectedSystem.jsx, which is retained on disk and unimported
// as the rollback target — restoring it is a two-line change in
// src/app/(main)/page.jsx. The hexagonal network it drew is rejected for
// homepage use: nothing here reuses its hub, its connectors or its node
// language.
//
// ⚠️ THE IMAGES ARE REAL PRODUCT SCREENS, captured from /send and the
// modernised /track against synthetic demonstration data. They contain no
// customer, driver, address, tracking code, price or payment information. Do
// not replace them with mockups, illustrations or stock photography, and do not
// re-crop them here — framing was settled at capture time.
//
// THE THREE ASSETS ARE DELIBERATELY DIFFERENT SHAPES. Request and Record are
// portrait; Track is a wide landscape. That progression — narrow, wide, narrow —
// is what makes the three moments read as different rather than as one screen
// shown three times.
//
// ⚠️ TRACK IS RENDERED WIDER THAN THE OTHER TWO, ON PURPOSE. Its source is
// 1428x683, so at 550-650px its secondary rows stop being readable; it was
// measured as good from about 700px. Its row therefore uses a wider container
// than the other two. Do not normalise the three widths.

const STAGES = [
  {
    number: '01',
    title: 'Request',
    sentence: 'Enter where the delivery starts and where it needs to go.',
    image: requestShot,
    alt: 'Druppr delivery request interface',
    sizes: '(min-width: 1280px) 620px, (min-width: 1024px) 520px, (min-width: 640px) 560px, 100vw',
    // Portrait. Copy left, image right.
    reversed: false,
    container: 'max-w-[1200px]',
    imageWidth: 'lg:w-[520px] xl:w-[620px]',
    copyWidth: 'lg:w-[300px] xl:w-[320px]',
    align: 'lg:items-start',
    copyOffset: 'lg:pt-14',
    tilt: 'lg:rotate-[0.6deg]',
    glow: 'lg:-right-16 lg:-top-10 lg:h-[420px] lg:w-[420px]',
  },
  {
    number: '02',
    title: 'Track',
    sentence: 'Follow the delivery as its status changes along the way.',
    image: trackShot,
    alt: 'Druppr active delivery tracking interface',
    sizes: '(min-width: 1280px) 860px, (min-width: 1024px) 560px, (min-width: 640px) 560px, 100vw',
    // Landscape, and the widest beat in the section. Image left, copy right.
    reversed: true,
    container: 'max-w-[1200px] xl:max-w-[1320px]',
    imageWidth: 'lg:w-[560px] xl:w-[860px]',
    copyWidth: 'lg:w-[260px] xl:w-[280px]',
    align: 'lg:items-center',
    copyOffset: '',
    tilt: 'lg:-rotate-[0.4deg]',
    glow: 'lg:-left-20 lg:-bottom-12 lg:h-[380px] lg:w-[560px]',
  },
  {
    number: '03',
    title: 'Record',
    sentence: 'Keep the completed delivery details together after the job is done.',
    image: recordShot,
    alt: 'Druppr completed delivery record',
    sizes: '(min-width: 1280px) 560px, (min-width: 1024px) 470px, (min-width: 640px) 560px, 100vw',
    // Portrait again, and compact — the journey closing.
    reversed: false,
    container: 'max-w-[1200px]',
    imageWidth: 'lg:w-[470px] xl:w-[560px]',
    copyWidth: 'lg:w-[300px] xl:w-[320px]',
    align: 'lg:items-center',
    copyOffset: '',
    tilt: 'lg:rotate-[0.7deg]',
    glow: 'lg:-right-12 lg:-bottom-10 lg:h-[400px] lg:w-[400px]',
  },
]

// ⚠️ `w-full` ON THE ROW IS LOAD-BEARING. Each row is a flex item of a column
// flex parent, and `mx-auto` cancels the default cross-axis stretch. Without an
// explicit width the row collapses to fit-content — and the screenshot
// contributes nothing to that, because it is sized in percent. The row then
// sized itself to the copy's max-w-[420px], which left every screenshot at
// 420px inside a 704px column at 768.
function Stage({ stage }) {
  return (
    <div
      className={`mx-auto flex w-full ${stage.container} flex-col gap-8 px-8 lg:flex-row lg:justify-between lg:gap-16 ${stage.align} ${
        stage.reversed ? 'lg:flex-row-reverse' : ''
      }`}
    >
      <div className={`lg:flex-none ${stage.copyWidth} ${stage.copyOffset}`}>
        <span className="font-display text-sm font-extrabold tracking-label text-brand-600">
          {stage.number}
        </span>
        <h3 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.02em] text-[#17131c] sm:text-3xl">
          {stage.title}
        </h3>
        <p className="mt-3 max-w-[420px] text-[15px] text-[#5f5868] sm:text-base">
          {stage.sentence}
        </p>
      </div>

      {/* The screenshot is the object. No card wraps it, no device frame, no
          fake browser chrome — the hairline and shadow sit on the image itself
          so it reads as a product surface floating on the page. */}
      <div className={`relative w-full sm:max-w-[560px] lg:max-w-none lg:flex-none ${stage.imageWidth}`}>
        {/* Atmosphere. Decorative depth only, placed differently per stage so
            the three do not read as the same blob repeated. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-6 hidden rounded-full bg-[radial-gradient(circle_at_center,rgba(123,47,190,0.10)_0%,rgba(123,47,190,0.04)_45%,rgba(123,47,190,0)_72%)] blur-[6px] lg:block ${stage.glow}`}
        />
        <Image
          src={stage.image}
          alt={stage.alt}
          sizes={stage.sizes}
          className={`relative w-full rounded-[18px] shadow-lift ring-1 ring-[#eeebf1] ${stage.tilt}`}
        />
      </div>
    </div>
  )
}

export function ProductStory() {
  return (
    // No band of its own: the section shares surface.page with what surrounds
    // it, so the screenshots float on one continuous ground rather than sitting
    // inside another tinted container.
    <section aria-labelledby="product-story" className="bg-surface-page">
      <div className="mx-auto max-w-[1200px] px-8 pt-16 sm:pt-20 lg:pt-24">
        <div className="max-w-[620px]">
          <span className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
            Product demonstration
          </span>
          <h2
            id="product-story"
            className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-[#17131c] sm:text-4xl"
          >
            See the delivery journey
          </h2>
          {/* ONE sentence. The screenshots carry the rest — do not add bullets,
              feature tags or per-control annotations. */}
          <p className="mt-4 text-lg text-[#5f5868]">
            Request a delivery, follow its progress and keep the record when
            it&rsquo;s done.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-16 pb-16 sm:mt-12 sm:gap-20 sm:pb-20 lg:mt-14 lg:gap-24 lg:pb-24">
        {STAGES.map((stage) => (
          <Stage key={stage.number} stage={stage} />
        ))}
      </div>
    </section>
  )
}
