// Navigation + footer content for the Druppr redesign.
//
// Every destination the redesign will eventually have is defined here, whether
// or not the page exists yet. `live` is the ship gate: Header and Footer render
// ONLY items with live: true and silently skip the rest. Launching a new page
// is therefore a one-flag change in this file, not an edit to a component.
//
// live: true is reserved for routes that EXIST in this repo today: /send,
// /medical, /legal, /contact-us and /privacy-policy. Everything else is
// scaffolding for pages that have not been built yet.
//
// The hrefs on non-live items are the intended final paths, not '#' placeholders.
// That is deliberate: it is what makes flipping the flag sufficient. If a page
// ships at a different path, correct the href here at the same time.

// Single source of truth per destination, so a given page's live status is
// recorded in exactly one place. Nav and footer supply their own labels for the
// same destination (the nav says "Medical", the footer says "Medical delivery"),
// but they must never disagree about whether it is shippable.
//
// Exported so page sections can gate on a specific destination — e.g. the home
// hero renders its address form only when ROUTES.send.live, and the services
// grid links a row only when that row's route is live. Read it; do not mutate.
export const ROUTES = {
  // Services
  // All three steps of the send flow ship: addresses, vehicle and price, and
  // Stripe payment with crash recovery. A customer can price AND book.
  send: { href: '/send', live: true },
  medical: { href: '/medical', live: true },
  legal: { href: '/legal', live: true },
  ride: { href: '/ride', live: false },
  marketplace: { href: '/marketplace', live: false },
  dropBatch: { href: '/drop-batch', live: false },
  tow: { href: '/tow', live: false },
  designatedDriver: { href: '/designated-driver', live: false },
  petTransport: { href: '/pet-transport', live: false },
  rentACar: { href: '/rent-a-car', live: false },
  trainingHub: { href: '/training-hub', live: false },

  // Company
  about: { href: '/about', live: false },
  becomeADriver: { href: '/become-a-driver', live: false },
  careers: { href: '/careers', live: false },
  contact: { href: '/contact-us', live: true },

  // Support
  // NOTE: /track exists only as /track/[trackingCode] — a deep link handed to a
  // customer. There is no /track index page to enter a code on, so this stays
  // live: false until one is built.
  track: { href: '/track', live: false },
  helpCentre: { href: '/help-centre', live: false },
  terms: { href: '/terms', live: false },
  privacy: { href: '/privacy-policy', live: true },
}

// --- External destinations --------------------------------------------------

// The business platform, where clinics, labs and firms open an account.
//
// A SEPARATE ORIGIN, not a route in this app — every use is a plain <a>, never
// next/link. It carries the legaldrop.ca domain rather than druppr.ca because
// that is where the platform actually serves; see BRAND in src/lib/config.js on
// why the two names coexist.
//
// Kept here so the marketing pages do not each re-type it.
export const PARTNER_URL = 'https://partner.legaldrop.ca'

// ── PHASE 5 CTA DESTINATION AUDIT ───────────────────────────────────────────
//
// Every B2B call to action used to point at PARTNER_URL itself. Verified by
// loading it: the bare origin REDIRECTS TO /login, titled "Login - LegalDrop",
// which renders an email/password form. So a clinic clicking "Set up your
// clinic account" arrived at a password field and had to find the small "Sign
// up" link underneath to do the thing the button had just offered.
//
// /signup is a real, self-serve account-creation form — verified, HTTP 200,
// titled "Sign up - LegalDrop": first name, last name, work email, contact
// phone, password, confirm password, "Create account". So the LABELS were
// accurate; only the destination was wrong, and the fix is to send
// account-creation intent to the page that creates accounts rather than to
// reword the buttons.
//
// Use PARTNER_SIGNUP_URL for "set up / register / create an account" CTAs, and
// PARTNER_URL where the intent is simply "go to the platform".
//
// ⚠️ The signup page describes itself as "Set up company access to schedule
// deliveries and monitor order statuses in real time." That is the partner
// platform's own copy on a different origin, and it is NOT imported into this
// site's marketing copy: Phases 4.2 and 4.3 removed scheduling claims from
// these pages for want of evidence in THIS repository. If the portal genuinely
// schedules, that is evidence a founder could produce to restore those claims —
// but it is confirmed by the founder, not by borrowing another surface's words.
export const PARTNER_SIGNUP_URL = 'https://partner.legaldrop.ca/signup'

// --- Header -----------------------------------------------------------------

// The Druppr design's nav is Medical / Legal / Track. Medical and Legal ship
// with this commit; Track is still live: false.
//
// TRANSITIONAL: 'Contact' is NOT in the Druppr design's nav. It is here so the
// live site keeps a working nav affordance while Medical, Legal and Track do
// not exist — shipping a header with no navigation at all is worse than
// deviating from the design for one link. /contact-us is a real page today.
//
// REMOVE this item once the design's own nav destinations ship — i.e. once
// /track ships, which is the last one outstanding.
export const NAV_LINKS = [
  { label: 'Medical', ...ROUTES.medical },
  { label: 'Legal', ...ROUTES.legal },
  { label: 'Track', ...ROUTES.track },
  { label: 'Contact', ...ROUTES.contact },
]

// DELIBERATE DEVIATION FROM THE DESIGN.
//
// DrupprNav's right-hand pill button reads "Sign in". Accounts do not exist in
// this product and are not in scope for launch, so shipping a "Sign in" button
// would point customers at something that cannot work. The launch-appropriate
// primary action is starting a delivery, so the button reads "Send a package"
// and targets /send instead.
//
// The send flow has shipped, so ROUTES.send.live is true and this button
// renders. It inherits that flag rather than carrying its own, which is what
// kept the two from drifting while the flow was still being built.
export const NAV_CTA = { label: 'Send a package', ...ROUTES.send }

// --- Footer -----------------------------------------------------------------

export const FOOTER_SECTIONS = [
  {
    id: 'services',
    title: 'Services',
    // The design lays Services out in a 2-column sub-grid; the other two
    // sections are single columns.
    columns: 2,
    items: [
      { label: 'Send a package', ...ROUTES.send },
      { label: 'Medical delivery', ...ROUTES.medical },
      { label: 'Legal documents', ...ROUTES.legal },
      { label: 'Request a ride', ...ROUTES.ride },
      { label: 'Marketplace', ...ROUTES.marketplace },
      { label: 'Drop Batch', ...ROUTES.dropBatch },
      { label: 'Tow truck', ...ROUTES.tow },
      { label: 'Designated driver', ...ROUTES.designatedDriver },
      { label: 'Pet transport', ...ROUTES.petTransport },
      { label: 'Rent a car', ...ROUTES.rentACar },
      { label: 'Training hub', ...ROUTES.trainingHub },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    columns: 1,
    items: [
      { label: 'About', ...ROUTES.about },
      { label: 'Become a driver', ...ROUTES.becomeADriver },
      { label: 'Careers', ...ROUTES.careers },
      { label: 'Contact', ...ROUTES.contact },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    columns: 1,
    items: [
      { label: 'Track a delivery', ...ROUTES.track },
      { label: 'Help centre', ...ROUTES.helpCentre },
      { label: 'Terms of service', ...ROUTES.terms },
      { label: 'Privacy policy', ...ROUTES.privacy },
    ],
  },
]

// --- Unconfirmed content ----------------------------------------------------

// UNCONFIRMED — must stay null until real values are supplied.
//
// The design's footer prints 1-855-378-7477 and hello@druppr.ca. Neither has
// been verified as a working, monitored channel, and publishing a support phone
// number or address that nobody answers is worse than publishing none: it looks
// like an outage to the customer and it is the number that ends up in receipts,
// screenshots and complaints.
//
// Footer skips the entire contact block while these are null, and /contact-us
// skips the matching row. Set them here and both appear — no component change
// required.
//
// THESE ARE NOW THE ONLY SOURCE. /contact-us used to hardcode its own phone and
// Gmail address, so the footer printed nothing while that page printed values
// nobody had signed off on. Both hardcoded values are gone; do not reintroduce
// a contact detail at a call site.
//
// SUPPORT_PHONE STORES DIGITS, NOT A FORMATTED STRING — E.164, e.g.
// '+13435984928'. It is used verbatim as a `tel:` href, and a tel: URI
// containing brackets and spaces is not something to rely on. Display
// formatting is formatPhone()'s job, below, so the value and its presentation
// cannot drift apart.
export const SUPPORT_PHONE = null
export const SUPPORT_EMAIL = null

// Renders SUPPORT_PHONE for humans: '+13435984928' -> '+1 (343) 598-4928'.
//
// Every surface that PRINTS the number goes through this; every surface that
// LINKS it uses the raw constant. That split is the whole point — one stored
// value, so the footer and /contact-us cannot disagree the day a real number
// lands.
//
// Returns the input untouched when it is not a 10- or 11-digit NANP number,
// which covers both null (nothing renders anyway) and a future non-North
// American number, which this format would otherwise mangle into a lie.
export function formatPhone(value) {
  if (!value) {
    return value
  }

  const digits = String(value).replace(/\D/g, '')
  const national =
    digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits

  if (national.length !== 10) {
    return value
  }

  return `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`
}

// UNCONFIRMED — the registered legal entity name must be supplied by the
// business owner. It stays null until then.
//
// A corporate-form suffix (Inc. / Ltd. / Corp.) on a live commercial site is a
// claim that a specific company is registered under that exact name. Nobody has
// verified this one, so it must not be published: an incorrect entity name in a
// copyright notice is wrong on the customer-facing page that also takes
// payments. Guessing it is not better than omitting it.
//
// While null, Footer falls back to BRAND.legalName — the brand name with no
// corporate form, which asserts nothing unverified.
//
// When confirmed, set the EXACT registered name here (including its suffix).
// Terminal punctuation is handled by the Footer, so it does not matter whether
// the value ends in a period.
//
// This arguably belongs alongside BRAND in src/lib/config.js; it lives here for
// now only because config.js was out of scope when it was introduced. Move it
// when config.js is next touched.
export const LEGAL_ENTITY = null

// --- Service area -----------------------------------------------------------
//
// One source of truth for how far the service reaches, in two registers.
//
// Three call sites used to disagree. The home hero hardcoded "Send anything
// across Toronto" — the narrowest of the three, and an understatement of the
// coverage; the root metadata description says "Toronto and the GTA"; the
// footer line below says "Now serving Toronto and the GTA".
//
//   SERVICE_AREA_PHRASE — drops into running copy ("Send anything across …").
//                         Deliberately does NOT name a city, so it stays true as
//                         more cities open.
//   SERVICE_AREA        — the standalone line in the footer's bottom bar.
//
// ⚠️ PHASE 9.1 CORRECTED THE RATIONALE ABOVE, NOT THE VALUE. It used to justify
// the city-less phrasing by saying it "matches the site tagline, 'Your city's
// same-day delivery network'". That tagline no longer exists: Gate 6 replaced
// the default title with "Same-day logistics infrastructure for the GTA",
// which names the market deliberately. The comment would otherwise have gone on
// citing a string that is nowhere in the codebase.
//
// THE VALUE IS UNCHANGED, and is currently rendered by nothing: its only
// consumer is home/Hero.jsx, the unimported Phase 2 rollback component. If that
// hero is ever restored, note that "Send anything across your city" now sits
// BELOW the title's stated GTA service area rather than matching it — resolve it
// then, on evidence, rather than pre-emptively editing a component nobody
// renders.
//
// STILL NOT WIRED: src/app/layout.jsx's metadata description spells the area out
// longhand and is not driven from here.
export const SERVICE_AREA_PHRASE = 'your city'

// Copy, not configuration, but kept here so it is not buried in JSX.
export const SERVICE_AREA = 'Now serving Toronto and the GTA'
