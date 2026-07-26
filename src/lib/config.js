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
// RESOLVED: the domain decision landed on Druppr. druppr.ca is secured, DNS has
// propagated, and the site serves there — so the wordmark now reads 'Druppr',
// matching the domain in the address bar.
//
// THE TWO NAMES ARE DELIBERATELY DIFFERENT. Do not "fix" the mismatch by
// aligning them:
//
//   name      — the consumer-facing wordmark. Header, footer, headings, titles.
//   legalName — the business behind it, which is STILL LegalDrop. It backs the
//               copyright notice (via Footer's LEGAL_ENTITY fallback) and any
//               legal or contractual copy. The rename is a rebrand, not a
//               re-registration: nothing about the entity has changed, and a
//               copyright line naming an entity that does not exist is worse
//               than one that looks out of step with the wordmark.
//
// The footer carries a "Druppr — formerly LegalDrop" line precisely so the
// '© LegalDrop' notice beneath a 'Druppr' wordmark reads as continuity rather
// than as the wrong site. Google Business Profile reviews are still filed under
// "LegalDrop", and that line is what connects them too.
//
// Do NOT hardcode either name in components, copy, or metadata — import BRAND
// and reference BRAND.name (consumer-facing) or BRAND.legalName (legal).
export const BRAND = {
  name: 'Druppr',
  legalName: 'LegalDrop',
}

// Intentionally NOT exported for use in next.config.js.
//
// The /pay/:code rewrite there must keep its hardcoded destination: Next.js
// resolves rewrites from the config loaded at server start, and NEXT_PUBLIC_*
// substitution does not apply to a rewrite destination at request time. That
// route is also a live Stripe payment path whose `beforeFiles` ordering is
// load-bearing, so it is deliberately left untouched.
