const headlessuiPlugin = require('@headlessui/tailwindcss')
const formsPlugin = require('@tailwindcss/forms')
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    // TYPE SCALE. Replaces Tailwind's default (note: NOT under extend), so every
    // text-* utility in the repo resolves here.
    //
    // Each step carries its own line-height, and from `xl` up its own negative
    // tracking. That pairing is the point: the previous scale was bypassed
    // entirely — the marketing pages typed arbitrary text-[Npx], which sets
    // font-size ONLY, so every heading inherited Preflight's line-height:1.5.
    // A 38px h2 rendered on 57px leading. Sizes that carry their own leading
    // cannot regress that way again.
    //
    // TRACKING IS DELIBERATELY ABSENT BELOW `xl`. Optical letter-spacing is a
    // function of size: display type needs negative tracking to stop looking
    // loose, body text does not. `xs` in particular is used for captions, micro
    // labels and legal copy — not just eyebrows — so its tracking stays opt-in
    // via `tracking-label` rather than being baked in. Do not add a letterSpacing
    // entry to xs/sm/base/lg; that is what `tracking-label` is for.
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1.5' }], //  12 — captions, micro labels, legal
      sm: ['0.875rem', { lineHeight: '1.55' }], //  14 — card descriptions, footer links
      base: ['1rem', { lineHeight: '1.6' }], //  16 — body copy
      lg: ['1.125rem', { lineHeight: '1.6' }], //  18 — lead paragraphs
      xl: ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em' }], //  20 — card titles
      '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.015em' }], //  24 — small headings
      '3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], //  30 — h2 mobile
      '4xl': ['2.375rem', { lineHeight: '1.15', letterSpacing: '-0.025em' }], //  38 — h2 desktop
      '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }], //  48 — h1 mid
      '6xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.035em' }], //  60 — h1 desktop
      // Unused today. Kept so the ramp stays complete and removing a utility
      // cannot bite later.
      '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.04em' }], //  72
      '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.045em' }], //  96
      '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.05em' }], // 128
    },
    extend: {
      // `marquee` was removed in Phase 1: a repository-wide search found no
      // consumer of `animate-marquee` or the `--marquee-duration` variable it
      // depended on. It was Pocket-template residue.
      //
      // The remaining entries here are ALSO currently unused, and are
      // deliberately left in place — Phase 1 was scoped to remove the confirmed
      // marquee configuration only. The two animations the app actually uses,
      // `animate-pulse` and `animate-spin`, are Tailwind built-ins and are not
      // defined here, so nothing below is load-bearing for them.
      animation: {
        'fade-in': 'fade-in 0.5s linear forwards',
        'spin-slow': 'spin 4s linear infinite',
        'spin-slower': 'spin 6s linear infinite',
        'spin-reverse': 'spin-reverse 1s linear infinite',
        'spin-reverse-slow': 'spin-reverse 4s linear infinite',
        'spin-reverse-slower': 'spin-reverse 6s linear infinite',
      },
      // SEMANTIC RADII. Named by what they wrap, not by size, so "what radius is
      // a card?" has exactly one answer. Before these, the marketing surface ran
      // four different card radii (16/18/20/22px) within two screens of scroll.
      //
      // rounded-full is untouched and still correct for pills, dots and avatars.
      borderRadius: {
        control: '12px', // buttons, inputs, fields
        tile: '10px', // icon tiles
        card: '20px', // cards, bands, image frames
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ELEVATION. All three are tinted on the #17131c ink token rather than
      // neutral black — a warm-grey surface lit by a neutral-black shadow reads
      // muddy. Multi-layer by design: a contact shadow seats the edge, a mid
      // layer supplies the lift.
      //
      // These are NEW names on purpose. Tailwind's own sm/md/lg are deliberately
      // NOT overridden, because pages outside this pass use them and must not
      // change silently.
      boxShadow: {
        card: '0 1px 2px rgba(23,19,28,0.05), 0 4px 12px -2px rgba(23,19,28,0.06)',
        lift: '0 1px 2px rgba(23,19,28,0.06), 0 8px 20px -4px rgba(23,19,28,0.10)',
        hero: '0 1px 2px rgba(23,19,28,0.08), 0 12px 28px -8px rgba(23,19,28,0.14), 0 28px 56px -24px rgba(23,19,28,0.20)',
      },

      // Named durations. `fast` is Tailwind's own default (150ms) under a name,
      // so existing bare `transition-*` utilities already match it.
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '360ms',
      },

      // The single positive-tracking value. Replaces the five ad-hoc eyebrow
      // values (0.01/0.06/0.08/0.1/0.12em) that were in use.
      letterSpacing: {
        label: '0.08em',
      },
      colors: ({ colors }) => ({
        gray: colors.neutral,

        // SURFACES. Named by the job they do, not by their value, so "what
        // colour is a card?" has one answer.
        //
        // These replace 12 ad-hoc tones that had accumulated across the
        // marketing pages. Four near-identical light tints were doing
        // overlapping jobs — #faf7fd, #f3ebfb, #f2ebfb and #f6f4f8, two of
        // which differed by a single point in the green channel and appeared in
        // the same grid — and four darks (#1a1220, #1a1421, #1c1424, #241a2e)
        // were serving as page, footer, band and card-header grounds.
        //
        // `page` is a WARM off-white, not #fff. That is the load-bearing
        // decision in this set: cards are pure white, so a white card now sits
        // ON a surface instead of dissolving into it. Every card shadow and
        // hairline on the site depends on that 4-point separation to be
        // visible at all.
        //
        // ONE DARK IS DELIBERATELY NOT HERE. #1c1424 survives in
        // ExpandingGallery as the photo scrim. It is not a surface — it is a
        // contrast-tuned overlay whose opacity steps are calculated against
        // measured text ratios (5.08:1 collapsed, 6.8:1 open). Folding it into
        // `ink` would change those numbers. Same for the Hero gradient.
        surface: {
          page: '#fbf9f8', // warm off-white — the page ground
          raised: '#ffffff', // cards and raised elements
          tint: '#f7f3fb', // the single light tint
          ink: '#1a1421', // the single dark
        },
        // Druppr brand purple. 600 is #7B2FBE, the prototype-confirmed brand
        // colour; 500/700/800 are a hue-locked ramp around it (hsl 272°) for
        // hover, active and emphasis states. brand-600 on white is 7.0:1, so
        // white-on-brand-600 is safe for buttons at any text size.
        //
        // Token first, converge later: the ~26 scattered purple-600/700/800
        // utilities and the two hex literals in PartnerTrackingMap.jsx are
        // deliberately NOT migrated in this commit. This only makes
        // bg-brand-600 (etc.) available so new work has one thing to target.
        brand: {
          500: '#8E43D0',
          600: '#7B2FBE',
          700: '#65259D',
          800: '#521C82',
        },
      }),
      fontFamily: {
        sans: 'var(--font-inter)',

        // DISPLAY FACE — Manrope, opt-in only.
        //
        // `sans` stays Inter and remains the global default. Nothing inherits
        // Manrope: it is applied deliberately via `font-display`, and only to
        // type at display size — h1, h2, and the 30px band titles that are
        // divs rather than headings. The tag is not what decides the face;
        // the size is. A display face at 14px does nothing except cost a
        // second font in the critical path, which is why the footer's 14px
        // section headings stay Inter despite being <h2>.
        //
        // Falls back through Inter to the system stack, so a failed font load
        // degrades to the body face rather than to Times.
        display: ['var(--font-manrope)', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'fade-in': {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        'spin-reverse': {
          to: {
            transform: 'rotate(-360deg)',
          },
        },
      },
      maxWidth: {
        '2xl': '40rem',
      },
    },
  },
  plugins: [formsPlugin, headlessuiPlugin],
}
