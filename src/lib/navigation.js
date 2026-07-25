// Navigation + footer content for the Druppr redesign.
//
// Every destination the redesign will eventually have is defined here, whether
// or not the page exists yet. `live` is the ship gate: Header and Footer render
// ONLY items with live: true and silently skip the rest. Launching a new page
// is therefore a one-flag change in this file, not an edit to a component.
//
// live: true is reserved for routes that EXIST in this repo today. As of this
// commit that is exactly two — /contact-us and /privacy-policy. Everything else
// is scaffolding for pages that have not been built yet.
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
  // Steps 1 and 2 of the send flow exist. Step 3 (payment) does not yet, so a
  // customer can price a delivery but not book one — the flow ends on a
  // disabled "Continue to payment".
  send: { href: '/send', live: true },
  medical: { href: '/medical', live: false },
  legal: { href: '/legal', live: false },
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

// --- Header -----------------------------------------------------------------

// The Druppr design's nav is Medical / Legal / Track. All three are live: false
// today, so on their own the bar would render as a bare wordmark.
//
// TRANSITIONAL: 'Contact' is NOT in the Druppr design's nav. It is here so the
// live site keeps a working nav affordance while Medical, Legal and Track do
// not exist — shipping a header with no navigation at all is worse than
// deviating from the design for one link. /contact-us is a real page today.
//
// REMOVE this item once the design's own nav destinations ship.
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
// /send has not been built, so this is live: false and the button does not
// render at all yet — better to show no call to action than a dead one. Flip
// this to live: true the moment the send flow ships.
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
// Footer skips the entire contact block while these are null. Set them here and
// the block appears — no component change required.
export const SUPPORT_PHONE = null
export const SUPPORT_EMAIL = null

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

// The service-area line in the footer's bottom bar. Copy, not configuration,
// but kept here so it is not buried in JSX.
export const SERVICE_AREA = 'Now serving Toronto and the GTA'
