// Decorative stylised city map behind the hero.
//
// The design draws this as ~60 absolutely-positioned divs with percentage
// offsets, plus fake street names ("Front St", "King St E", "Gardiner Expy"), a
// CN Tower glyph and a "Lake Ontario" caption. None of that is ported:
//
//  - It is one inline SVG instead of 60 divs. Percentage-positioned divs would
//    need inline styles (Tailwind cannot generate arbitrary values from data),
//    and 60 hand-maintained elements is not something anyone will keep tidy.
//    An SVG viewBox scales to any hero size for free.
//  - All text labels are gone. They were decorative approximations, not a real
//    map — printing plausible street names on a shape that does not match the
//    actual geography invites the reader to believe it is one. The abstract
//    shape reads as "city" without asserting anything.
//  - No Google Maps. This is decoration; loading a billed, interactive map SDK
//    to draw a background would be absurd.
//
// Kept from the design: the road grid with its two cream arterials, the diagonal
// cuts, building and park blocks, the Lake Ontario band along the bottom, and
// the two pins that read as pickup and dropoff.
//
// Purely decorative — aria-hidden, no accessible name.

export function CityMap({ className }) {
  return (
    <svg
      viewBox="0 0 1200 520"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="1200" height="520" className="fill-[#eceee8]" />

      {/* Diagonal cuts, drawn under the grid. */}
      <g className="fill-white">
        <rect x="-140" y="44" width="1480" height="6" transform="rotate(11 600 260)" />
        <rect x="-140" y="368" width="1480" height="6" transform="rotate(-6 600 260)" />
      </g>

      {/* Blocks. */}
      <g className="fill-[#e0e4da]">
        <rect x="204" y="83" width="60" height="44" />
        <rect x="300" y="135" width="76" height="32" />
        <rect x="576" y="135" width="64" height="38" />
        <rect x="768" y="166" width="80" height="30" />
        <rect x="960" y="151" width="60" height="36" />
        <rect x="576" y="260" width="52" height="26" />
        <rect x="792" y="260" width="66" height="26" />
      </g>
      <g className="fill-[#dfe3d8]">
        <rect x="384" y="88" width="48" height="56" />
        <rect x="678" y="88" width="44" height="44" />
        <rect x="864" y="104" width="56" height="48" />
      </g>

      {/* Parks. */}
      <g className="fill-[#dae7cf]">
        <rect x="296" y="216" width="80" height="66" />
        <rect x="956" y="216" width="100" height="52" />
      </g>

      {/* Road grid. */}
      <g className="fill-white">
        <rect x="0" y="31" width="1200" height="5" />
        <rect x="0" y="78" width="1200" height="9" />
        <rect x="0" y="125" width="1200" height="4" />
        <rect x="0" y="161" width="1200" height="4" />
        <rect x="0" y="255" width="1200" height="4" />
        <rect x="0" y="291" width="1200" height="9" />
        <rect x="0" y="328" width="1200" height="4" />

        <rect x="96" y="0" width="4" height="520" />
        <rect x="192" y="0" width="9" height="520" />
        <rect x="288" y="0" width="4" height="520" />
        <rect x="372" y="0" width="4" height="520" />
        <rect x="564" y="0" width="4" height="520" />
        <rect x="660" y="0" width="9" height="520" />
        <rect x="756" y="0" width="4" height="520" />
        <rect x="852" y="0" width="4" height="520" />
        <rect x="948" y="0" width="9" height="520" />
        <rect x="1056" y="0" width="4" height="520" />
      </g>

      {/* The two cream arterials. */}
      <g className="fill-[#fdf6e3] stroke-[#ecdfb8]" strokeWidth="1">
        <rect x="0" y="208" width="1200" height="14" />
        <rect x="468" y="0" width="14" height="520" />
      </g>

      {/* Lake Ontario. */}
      <path
        d="M0 420 L192 405 L504 426 L816 398 L1200 414 L1200 520 L0 520 Z"
        className="fill-[#bcd6ec]"
      />

      {/* Pickup and dropoff pins. */}
      <circle cx="720" cy="229" r="8" strokeWidth="4" className="fill-brand-600 stroke-white" />
      <circle cx="792" cy="177" r="8" strokeWidth="4" className="fill-[#17131c] stroke-white" />
    </svg>
  )
}
