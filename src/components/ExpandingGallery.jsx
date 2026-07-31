'use client'

import { useId, useState } from 'react'
import Image from 'next/image'

import { PARTNER_URL } from '@/lib/navigation'

// An expanding photo gallery, shared by /medical ("What we move") and /legal
// ("Legal services"). It replaced the identical three-card grids those pages
// each carried.
//
// The only client component on either page — it needs click state, so it is a
// small island inside two otherwise-server pages. It holds no copy: heading,
// panels and CTA label all arrive as props, because the two pages sell to
// different buyers and their copy is constrained in ways this component has no
// business knowing about.
//
// LAYOUT, at a glance:
//
//   below lg   three stacked cards. No accordion, no click, nothing hidden.
//              Height follows the content — a fixed aspect ratio would clip the
//              longer descriptions at 380px.
//   lg and up  a 440px row. Exactly one panel is open; the rest are 76px strips
//              carrying a rotated title. Clicking a strip opens it.
//
// Panel titles run up to 31 characters ("Temperature-controlled transport"). A
// 76px strip leaves ~44px of measure, which is about five characters a line —
// horizontal text there is unreadable however it is set. Rotating the title
// gives it the panel's 440px height as its measure instead, which fits the
// longest title at 15px with room over. It reads bottom-to-top, the book-spine
// convention, which also puts the start of each title on the same baseline the
// eye lands on when scanning the row.
//
// writing-mode is not a core Tailwind 3.4 utility (it lands in v4), hence the
// arbitrary property.

export function ExpandingGallery({ heading, panels, cta }) {
  const [openIndex, setOpenIndex] = useState(0)

  // Panel titles are referenced by id from their button's aria-labelledby, so
  // the ids have to be unique per instance — both pages render one of these.
  const baseId = useId()

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
      <h2 className="font-display text-3xl font-extrabold text-[#17131c]">
        {heading}
      </h2>

      <div className="mt-6 flex flex-col gap-[22px] lg:h-[440px] lg:flex-row lg:gap-4">
        {panels.map((panel, index) => (
          <Panel
            key={panel.title}
            panel={panel}
            cta={cta}
            titleId={`${baseId}-${index}`}
            open={index === openIndex}
            onOpen={() => setOpenIndex(index)}
          />
        ))}
      </div>
    </section>
  )
}

function Panel({ panel, cta, titleId, open, onOpen }) {
  return (
    <div
      className={`relative isolate min-h-[320px] overflow-hidden rounded-card lg:min-h-0 lg:flex-[0_1_76px] lg:transition-[flex-grow] lg:duration-slow lg:ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:!transition-none ${
        open ? 'lg:flex-[1_1_76px]' : ''
      }`}
    >
      {/* flex-grow is the only animated property here: one width transition per
          click, nothing else moving. The panels keep a fixed 76px basis, so a
          collapsed strip is exactly 76px and the open one absorbs the rest. */}
      <Image
        src={panel.image}
        alt={panel.alt}
        fill
        sizes="(min-width: 1024px) 66vw, calc(100vw - 4rem)"
        className="object-cover"
      />

      {/* SCRIM, PART ONE — a flat wash over the whole panel.

          The six photographs put their bright areas in different places: the
          courthouse is open sky at the top, the envelope is a lit desk at the
          bottom, and the specimen rack is pale edge to edge with no dark region
          to lean on at all. A directional gradient alone cannot serve all three,
          so a uniform floor comes first and the gradient shapes what is left.

          0.35 open, 0.62 collapsed. The higher figure is not decoration: a
          collapsed strip's rotated title is 15px bold — below the 18.66px that
          would let it count as large text — so it needs the full 4.5:1, and
          0.62 over a pure-white pixel composites to 5.08:1. It also makes a
          closed panel read as a label rather than a picture.

          Tinted #1c1424: the #17131c ink token warmed toward the brand hue.
          Transitioned on the same 360ms as the width so the two move together. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-[#1c1424]/35 transition-colors duration-slow motion-reduce:!transition-none ${
          open ? '' : 'lg:bg-[#1c1424]/[0.62]'
        }`}
      />

      {/* SCRIM, PART TWO — the directional layer, over the text.

          Two gradients because the text zones genuinely differ. Below lg the
          copy fills nearly the whole card, so the gradient keeps a floor of 0.46
          everywhere (combined with the base: 0.649, or 5.4:1 on white). At lg
          the copy sits in the bottom 46%, so it holds 0.55 flat across exactly
          that band (combined 0.7075, or 6.8:1 on white) and then eases out so
          the top of the photograph is left alone.

          Flat across the band, not a ramp to the edge: a gradient that only
          reaches full strength at the very bottom leaves the first line of the
          description sitting at 3.7:1, which fails. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[image:linear-gradient(to_top,rgba(28,20,36,0.60)_0%,rgba(28,20,36,0.52)_60%,rgba(28,20,36,0.46)_100%)] lg:bg-[image:linear-gradient(to_top,rgba(28,20,36,0.55)_0%,rgba(28,20,36,0.55)_46%,rgba(28,20,36,0.22)_68%,rgba(28,20,36,0)_88%)]"
      />

      {/* The control. It covers the panel and sits UNDER the copy, because the
          copy contains a link and an <a> inside a <button> is invalid markup —
          the same trap noted in home/Hero.jsx. The copy block is
          pointer-events-none apart from that link, so a click anywhere else on
          the panel reaches this button.

          Its accessible name comes from the <h3> below via aria-labelledby
          rather than from the rotated span, which is marked decorative. Name
          computation follows aria-labelledby into hidden elements, so the button
          keeps its name while collapsed, and the title is not announced twice
          while open.

          Hidden entirely below lg: there is no accordion there, so there is no
          control to expose. */}
      <button
        type="button"
        onClick={onOpen}
        aria-expanded={open}
        aria-labelledby={titleId}
        className="absolute inset-0 z-10 hidden focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white lg:flex lg:items-end lg:justify-center lg:pb-7"
      >
        <span
          aria-hidden="true"
          className={`rotate-180 text-base font-semibold tracking-label text-white [writing-mode:vertical-rl] ${
            open ? 'invisible' : ''
          }`}
        >
          {panel.title}
        </span>
      </button>

      {/* The copy. In normal flow below lg — it is what gives the card its
          height — and pinned to the bottom of the panel at lg.

          It reveals on a 340ms delay, just past the 360ms width transition, so
          nothing reflows while the panel is still growing. Closing is not
          animated: the copy would otherwise be reflowing inside a shrinking
          strip for 200ms, which looks worse than simply going.

          `invisible` rather than opacity alone: visibility:hidden takes the
          collapsed panel's link out of the tab order and out of the
          accessibility tree, which opacity would not.

          The motion-reduce overrides carry !. In this build Tailwind happens to
          emit its motion-reduce block after the lg one, so they would win on
          source order alone — but that ordering is not a contract, and this is
          the accessibility floor. It should not depend on which block the
          compiler puts last. */}
      <div
        className={`relative z-20 flex flex-col p-7 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-0 lg:transition-opacity lg:duration-200 motion-reduce:!transition-none motion-reduce:!delay-0 ${
          open
            ? 'lg:visible lg:opacity-100 lg:delay-[340ms]'
            : 'lg:invisible lg:opacity-0'
        }`}
      >
        <h3
          id={titleId}
          className="text-xl font-bold text-white"
        >
          {panel.title}
        </h3>
        <p className="mt-2.5 text-base text-white/85">{panel.description}</p>

        {/* External origin, so a plain anchor rather than next/link, same tab —
            as everywhere else on these two pages. Underline on hover instead of
            a colour shift: over a photograph any tint darker than white costs
            contrast. */}
        <a
          href={PARTNER_URL}
          className="pointer-events-auto mt-6 self-start text-base font-semibold text-white underline-offset-4 hover:underline"
        >
          {cta} <span aria-hidden="true">→</span>
        </a>
      </div>

      {/* Hairline, matching home/Coverage.jsx: an overlay, not a ring on the
          wrapper, because an inset box-shadow paints beneath child content and
          would sit behind the photograph.

          Neutral rather than brand — a purple frame is decoration doing a
          structural job, and purple is reserved for action. See the fuller
          note at the Coverage call site, including when this is too weak. */}
      <div className="pointer-events-none absolute inset-0 z-30 rounded-card ring-1 ring-inset ring-[#17131c]/10" />
    </div>
  )
}
