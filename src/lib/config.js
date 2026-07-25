// Shared runtime configuration.
//
// Before this module existed, the backend host was a hardcoded literal in six
// separate source files (plus the /pay/:code rewrite in next.config.js, which
// deliberately still hardcodes it — see the note at the bottom of this file).
// Everything that varies by environment should be resolved here and imported,
// not re-typed at the call site.

// The literal fallback is deliberate, not an oversight.
//
// This repo read ZERO environment variables before this commit — there is no
// .env file, no deploy-time env wiring, and nothing in the build pipeline that
// sets NEXT_PUBLIC_API_BASE_URL. Defaulting to the current production host
// means a missing variable cannot change today's behaviour: an unconfigured
// environment resolves to exactly the string the six call sites used to
// contain. Set NEXT_PUBLIC_API_BASE_URL to point a deploy at staging.
//
// NOTE: NEXT_PUBLIC_* values are inlined at BUILD time, not read at runtime.
// Changing this variable requires a rebuild, not just a restart.
//
// Includes the trailing /api segment — every existing call site composed its
// URLs as `${host}/api/<path>`, so keeping /api here keeps those composed URLs
// byte-identical.
const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://seal-app-9hhnm.ondigitalocean.app/api'

// Callers append '/public/track', '/contact-form', etc. Strip any trailing
// slash so a var set as '.../api/' cannot produce a double slash. A no-op for
// the default above, which has no trailing slash.
export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '')

// Brand naming.
//
// STILL UNRESOLVED: the consumer-facing name is pending a domain decision.
// 'Druppr' remains the working consumer brand for the redesign.
//
// But the rendered name is 'LegalDrop' for now, deliberately. This site is live
// at legaldrop.ca, and its Google Business Profile reviews are filed under
// "LegalDrop". Rendering "Druppr" would put the wordmark out of step with both
// the domain in the address bar and the name on the reviews customers arrive
// from — which reads as the wrong site, and risks the review history not being
// recognised as belonging to this business. The name must match the domain and
// the reviews until the domain decision is actually made.
//
// This constant is still the single flip point: when Druppr is confirmed and
// druppr.ca is secured, this one line changes. Do NOT hardcode either name in
// components, copy, or metadata — import BRAND and reference BRAND.name (for
// consumer-facing surfaces) or BRAND.legalName (for legal/contractual copy).
export const BRAND = {
  name: 'LegalDrop',
  legalName: 'LegalDrop',
}

// Intentionally NOT exported for use in next.config.js.
//
// The /pay/:code rewrite there must keep its hardcoded destination: Next.js
// resolves rewrites from the config loaded at server start, and NEXT_PUBLIC_*
// substitution does not apply to a rewrite destination at request time. That
// route is also a live Stripe payment path whose `beforeFiles` ordering is
// load-bearing, so it is deliberately left untouched.
