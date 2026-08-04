import Image from 'next/image'

import { PARTNER_SIGNUP_URL } from '@/lib/navigation'

// The service panels shared by /medical ("What we move") and /legal, where the
// section is the page hero.
//
// ── WHY THIS REPLACED ExpandingGallery ──────────────────────────────────────
//
// The previous component was a lateral accordion: one open panel, the rest
// collapsed to 76px strips carrying a rotated title, opened by clicking. That
// component is RETAINED ON DISK, unimported, at components/ExpandingGallery.jsx
// as the rollback target.
//
// It was replaced for one reason, and it is worth stating precisely because the
// reason people usually assume is wrong:
//
//   ⚠️ THE ACCORDION HAD NO LAYOUT BUG. Phase 4.2 and Phase 4.3 both reported
//   that it "collapsed" at 1440px, occupying ~380px of a 1200px container with
//   copy clipped mid-sentence. THAT FINDING WAS FALSE. It was an artifact of
//   capturing screenshots with Puppeteer's fullPage option, which changes the
//   emulated device metrics and re-triggers the 360ms transition-[flex-grow];
//   the capture then lands on the transition's first frame, where every panel
//   is still at its 76px flex-basis. Measured live, the open panel was 952px of
//   a 1136px row on /legal and 1044px on /medical. Exactly as designed.
//
//   THE REAL DEFECT WAS RESILIENCE. With JavaScript disabled, the accordion's
//   open panel is fixed at index 0 and there is no way to reach the others:
//   at lg the closed panels' copy is visibility:hidden/opacity:0 inside a 76px
//   strip, and on /legal below lg they are 64px rows whose expand button does
//   nothing. Two of three services were unreachable. That violates the floor in
//   HOMEPAGE_IMPLEMENTATION_PLAN.md §11 — "no content hidden behind JS" — and
//   VISION.md's minimal-client-JS and accessibility principles.
//
// With two panels on /medical and three on /legal there is no space pressure
// that an accordion needs to relieve, so the simplest architecture that keeps
// every service comprehensible is to show them all. This component therefore
// has NO client JavaScript, no state, no hover dependency, no keyboard
// affordance to get wrong, and nothing to suppress under reduced motion. It is
// a server component, which removes the only client boundary from both pages.
//
// ── WHAT WAS DELIBERATELY CARRIED OVER ──────────────────────────────────────
//
// The card treatment is the accordion's OPEN-panel treatment, unchanged. That
// is not laziness: the open panel's scrim values are measured, documented
// contrast decisions, and reusing them means no text/ground pair on either page
// needs re-measuring. The values and their reasoning are restated at each layer
// below so they survive without the original file.
//
// Copy is always visible now, so there is no state in which a panel shows a
// photograph and withholds its description.

const DEFAULT_CONTAINER = 'mx-auto max-w-[1200px] px-8 py-16 sm:py-24'
const DEFAULT_HEADING = 'font-display text-3xl font-extrabold text-[#17131c]'

export function ServicePanels({
  heading,
  panels,
  cta,
  // 'h1' when this section IS the page's hero (/legal); 'h2' everywhere else.
  headingLevel: Heading = 'h2',
  headingClassName = DEFAULT_HEADING,
  containerClassName = DEFAULT_CONTAINER,
  // A full-bleed ground. When omitted there is no wrapper element at all.
  groundClassName,
  // An optional lead paragraph under the heading.
  lede,
  ledeClassName,
  // Panel titles sit one level under the section heading. Default h3 is correct
  // under an h2; a hero using h1 passes h2 so the outline does not skip.
  panelHeadingLevel = 'h3',
  // The section CTA's own styling, because the two callers sit on opposite
  // grounds: /medical on the light page ground takes the filled brand button,
  // /legal on surface-ink takes the white one. Defaults to the light-ground
  // treatment, which is the same recipe medical/page.jsx PartnerCta uses.
  ctaClassName = 'inline-block rounded-control bg-brand-600 px-[30px] py-4 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
}) {
  // Track count follows content, the same rule home/WhyBrand.jsx uses: three
  // panels in a two-column grid would leave a dead cell, and two in a
  // three-column grid would leave two. /medical runs two panels since Phase 4.3
  // removed the temperature-controlled claim; /legal runs three.
  const columns = panels.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'

  const section = (
    <section className={containerClassName}>
      <Heading className={headingClassName}>{heading}</Heading>

      {lede && <p className={ledeClassName}>{lede}</p>}

      <div className={`mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 ${columns}`}>
        {panels.map((panel) => (
          <Panel
            key={panel.title}
            panel={panel}
            headingLevel={panelHeadingLevel}
          />
        ))}
      </div>

      {/* ONE call to action for the section, not one per card.

          The accordion could afford a per-panel CTA because only one panel was
          ever open, so only one was ever on screen. Showing every card at once
          turned that into the same sentence repeated two or three times in a
          row — visual noise, and two or three extra tab stops that all go to
          the same URL. External origin, so a plain anchor rather than
          next/link, same tab, as everywhere else on these two pages. */}
      {cta && (
        <div className="mt-8">
          <a href={PARTNER_SIGNUP_URL} className={ctaClassName}>
            {cta}
          </a>
        </div>
      )}
    </section>
  )

  return groundClassName ? (
    <div className={groundClassName}>{section}</div>
  ) : (
    section
  )
}

function Panel({ panel, headingLevel: PanelHeading = 'h3' }) {
  return (
    <div className="relative isolate flex min-h-[320px] flex-col overflow-hidden rounded-card lg:min-h-[400px]">
      <Image
        src={panel.image}
        alt={panel.alt}
        fill
        // Cards are a third of a 1200px column at lg, half at sm, and full
        // width minus the container padding below that.
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc(100vw - 4rem)"
        className="object-cover"
      />

      {/* SCRIM, PART ONE — a flat wash over the whole card.

          The photographs put their bright areas in different places: the
          courthouse is open sky at the top, the envelope is a lit desk at the
          bottom, and the specimen rack is pale edge to edge with no dark region
          to lean on at all. A directional gradient alone cannot serve all
          three, so a uniform floor comes first and the gradient shapes what is
          left.

          0.35 is the accordion's OPEN-panel value, carried over unchanged. Its
          0.62 collapsed value is gone with the collapsed state — there are no
          collapsed panels now, so there is no 15px rotated title needing the
          heavier wash.

          Tinted #1c1424: the #17131c ink token warmed toward the brand hue. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#1c1424]/35"
      />

      {/* SCRIM, PART TWO — the directional layer, under the text.

          Two gradients because the text zones genuinely differ by width. On a
          narrow card the copy fills most of the height, so the gradient keeps a
          floor of 0.46 everywhere (combined with the base: 0.649, or 5.4:1 on
          white). At lg the copy sits in the bottom band, so it holds 0.55 flat
          across exactly that band (combined 0.7075, or 6.8:1 on white) and then
          eases out so the top of the photograph is left alone.

          Flat across the band, not a ramp to the edge: a gradient that only
          reaches full strength at the very bottom leaves the first line of the
          description sitting at 3.7:1, which fails. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[image:linear-gradient(to_top,rgba(28,20,36,0.60)_0%,rgba(28,20,36,0.52)_60%,rgba(28,20,36,0.46)_100%)] lg:bg-[image:linear-gradient(to_top,rgba(28,20,36,0.55)_0%,rgba(28,20,36,0.55)_46%,rgba(28,20,36,0.22)_68%,rgba(28,20,36,0)_88%)]"
      />

      {/* The copy, pushed to the bottom of the card by mt-auto so that cards of
          unequal copy length still align their text to a common baseline.

          No visibility or opacity state: every panel shows its title and
          description at every width, with JavaScript on or off. That is the
          whole point of the rewrite.

          Nothing in the card is focusable. It carries no link, no button and no
          hover-revealed content, so there is no false affordance and no tab
          stop that goes nowhere — the section's single CTA below the grid is
          the only control. */}
      <div className="relative z-20 mt-auto flex flex-col p-7">
        <PanelHeading className="text-xl font-bold text-white">
          {panel.title}
        </PanelHeading>
        <p className="mt-2.5 text-base text-white/85">{panel.description}</p>
      </div>

      {/* Hairline. An overlay rather than a ring on the wrapper: an inset
          box-shadow paints beneath child content, so a ring on the wrapper
          would sit behind the photograph and never be seen.

          WHITE, NOT INK, AND THE SCRIMS ARE WHY. Every card here is darkened by
          design before this line paints over it. Ink at a low alpha disappears
          into it completely — a near-black line over a deliberately near-black
          edge separates nothing.

          12% keeps it a hairline rather than a highlight, and it is the same
          value home/Coverage.jsx uses, so card images across the site terminate
          identically. Do not thicken it; a visible frame reads cheap. */}
      <div className="pointer-events-none absolute inset-0 z-30 rounded-card ring-1 ring-inset ring-white/[0.12]" />
    </div>
  )
}
