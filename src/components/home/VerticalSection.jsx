import Image from 'next/image'
import Link from 'next/link'

import { ROUTES } from '@/lib/navigation'
import specimen from '@/images/medical-specimen.jpg'
import legalDocument from '@/images/legal-document.jpg'

// The two account-based verticals, given real weight on the home page.
//
// One component rendered twice. The only differences between the two are the
// content, which side the photograph sits on, and whether the section carries
// a tint band — so they are props, not a second file.
//
// WHY THESE TWO GET A SECTION AT ALL. Everything else on this page is
// instant-booked: enter two addresses, see a price, pay. Medical and legal are
// the opposite — contracted, account-based, no price quoted here. That is a
// genuine difference in how a customer buys, not a difference in marketing
// emphasis, and it is what the eyebrow above each heading is for. It sets the
// click expectation before the reader commits: this link goes to a page about
// opening an account, not to a checkout.
//
// ── COPY IS CONSTRAINED. READ BEFORE EDITING ────────────────────────────────
//
// The copy below is bound by the SAME exclusion lists that govern the pages it
// links to. Those lists are the authority and they live at their call sites:
//
//   src/app/(main)/medical/page.jsx   the block above CREDENTIALS
//   src/app/(main)/legal/page.jsx     the block above SERVICES
//
// In short, and non-exhaustively: no pickup-time figure, no client count, no
// "signature on delivery" (the handover is a DROP-OFF CODE), no photo proof,
// no seals or tamper-evident packaging, no affidavit of service, no
// temperature telemetry or validated-cooler claim, no attempt-count service
// level. These buyers are audited themselves, and the legal claims are ones a
// court may be asked to lean on.
//
// Read the full lists before changing a word here. A claim that is wrong on
// this page is wrong in the same way it would be on the destination page — it
// is simply reaching the reader one screen earlier.
//
// The photographs are also deliberate: the frames chosen show what MOVES, not
// a mechanism. Nothing depicts a seal, a signature or a temperature readout,
// because the copy cannot claim any of them. Alt text is carried over verbatim
// from the destination pages, where it was already written to describe the
// frame and nothing more.

// 4:3 at every width. Both source photographs are natively 4:3, so this is the
// one ratio that crops nothing — and it keeps these two sections from eating
// the page, which a taller crop did.
//
// THE max-w IS STILL LOAD-BEARING WHILE STACKED. Between 640 and 1023 this
// frame is the whole container — 689px at 768 — and an uncapped photograph
// there reads as a billboard rather than as one element of a section. Capping
// the width is what holds it to a sensible block. At 390 the container is
// already narrower than the cap, so nothing changes there; from lg the grid
// column governs and the cap is released.
const IMAGE_FRAME =
  'relative aspect-[4/3] max-w-[440px] overflow-hidden rounded-card shadow-lift lg:max-w-none'

// The hairline goes on an overlay, not as a ring on the frame: an inset
// box-shadow paints beneath child content, so a ring on the wrapper would sit
// behind the photograph. Same value as home/Coverage.jsx and ExpandingGallery.
const HAIRLINE =
  'pointer-events-none absolute inset-0 rounded-card ring-1 ring-inset ring-white/[0.12]'

// Primary link recipe, plus the focus treatment from home/Hero.jsx.
const CTA =
  'mt-8 inline-block rounded-control bg-brand-600 px-[30px] py-4 text-base font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

// Uppercased in CSS rather than typed in capitals, so the text a screen reader
// receives is a normal phrase rather than a run of letters.
const EYEBROW =
  'block text-sm font-semibold uppercase tracking-label text-[#8d8695]'

export const MEDICAL_VERTICAL = {
  eyebrow: 'For clinics & labs',
  heading: 'Same-day medical transport',
  // "Monthly invoicing" was here and is gone: it names a billing product
  // nobody has verified exists in the form that phrase implies. The account
  // framing stays, because that is a fact about how the service is arranged
  // rather than a claim about what it bills.
  lead: 'Specimen runs, pharmacy stock and temperature-sensitive goods, moved by TDG-certified drivers. Standing routes are arranged on your account, not booked per drop.',
  cta: 'See medical delivery',
  href: ROUTES.medical.href,
  image: specimen,
  alt: 'Sample tubes standing in a laboratory rack.',
}

export const LEGAL_VERTICAL = {
  eyebrow: 'For law firms',
  heading: 'Filings and confidential files',
  // "Served documents" was here and is gone. It reads as an assertion that
  // service of process was legally effected, which this business does not
  // claim and cannot evidence — the same ground the affidavit and sworn-service
  // exclusions cover.
  //
  // /legal is careful about exactly this and the phrasing here mirrors it. Its
  // Process serving panel promises the TRIP and the RECORD, never the legal
  // outcome: "Served documents delivered to the address you provide, with a
  // timestamped record of the attempt returned to your firm." The operative
  // word is "attempt". So this lead names the run, not a completed service.
  lead: 'Filings, confidential files and process-serving runs, moved by drivers who must complete confidentiality training. Every job carries a timestamped trail and a drop-off code, on your firm’s account.',
  cta: 'See legal delivery',
  href: ROUTES.legal.href,
  image: legalDocument,
  alt: 'Two people passing a large document envelope across a desk.',
}

export function VerticalSection({
  eyebrow,
  heading,
  lead,
  cta,
  href,
  image,
  alt,
  // Which side the photograph takes at lg. Below lg the panes stack and the
  // photograph is always first, whichever side it would occupy on desktop.
  imageSide = 'left',
  // A full-bleed tint band. It needs the wrapper below for the same reason
  // home/Services.jsx does: the tint runs the whole viewport while the content
  // stays in the 1200px column, and those cannot be the same element.
  tinted = false,
}) {
  const imageFirst = imageSide === 'left'

  return (
    <section className={tinted ? 'bg-surface-tint' : undefined}>
      <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* DOM order is photograph then text, always. That is the stacked
              order we want on a phone, and `order` only reorders the two
              columns at lg — so the reading order a screen reader or a
              keyboard user gets never depends on which side the picture
              happens to sit on. */}
          <div className={imageFirst ? undefined : 'lg:order-2'}>
            <div className={IMAGE_FRAME}>
              <Image
                src={image}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 48vw, calc(100vw - 4rem)"
                className="object-cover"
              />
              <div aria-hidden="true" className={HAIRLINE} />
            </div>
          </div>

          <div className={imageFirst ? undefined : 'lg:order-1'}>
            <span className={EYEBROW}>{eyebrow}</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-[#17131c]">
              {heading}
            </h2>
            <p className="mt-4 max-w-[560px] text-lg text-[#5f5868]">{lead}</p>
            {/* Internal, so next/link — this goes to the vertical's own page,
                which is where the partner-platform call to action lives. It
                deliberately does NOT jump straight to that platform: the page
                in between is the one that does the selling. */}
            <Link href={href} className={CTA}>
              {cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
