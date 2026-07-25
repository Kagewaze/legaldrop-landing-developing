// Shared Google Maps JavaScript API loader.
//
// Single bootstrap for every Maps surface in the app. Before this module the
// loader snippet was pasted into TrackingMap.jsx and PartnerTrackingMap.jsx and
// maintained separately; the send flow's address autocomplete would have made a
// third copy, with a third copy of the API key.
//
// Browser-side only. The key here is a BROWSER key and is public by nature —
// it ships in the client bundle and is visible in the network tab. That is how
// Maps works. It is protected by HTTP-referrer restrictions in Cloud Console,
// NOT by secrecy. Do not confuse it with GOOGLE_PLACES_API_KEY, which is
// server-only and must never be exposed.

// TRANSITIONAL FALLBACK.
//
// The literal is the key that was hardcoded in both tracking map components
// before this module existed. It stays as a fallback so that a deploy without
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY set behaves exactly as it does today — the
// live tracking pages must not go dark because an env var has not been added
// yet. Set the env var in the deploy environment, confirm the maps still work,
// and then this literal can be deleted.
const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyA5Hf0alZULns0oB_VjhwOEQJog4LvYF1w'

// PINNED. Do not change this casually.
//
// Both previous loaders used v:'weekly', which means Google ships a new version
// into production every week with no commit in this repo — a breaking change
// arrives on its schedule, not ours, and the first sign of it is a broken map
// on a customer's tracking page.
//
// '3.64' is the current quarterly (stable) release. Verified: 'quarterly' and
// '3.64' both resolve to 3.64.14a; 'weekly' was on 3.65.10a. Pinning to the
// minor still picks up patch releases (3.64.x) so bug and security fixes flow,
// but feature and breaking changes do not.
//
// BUMPING THIS IS A DELIBERATE CHANGE. It requires a smoke test of:
//   1. /track/[trackingCode]        — map renders, driver marker appears
//   2. /track-partner/[trackingToken] — map renders, route + pins + car marker
//   3. the send flow address autocomplete
// (3) is the reason this matters now. PlaceAutocompleteElement is a web
// component whose selection event has already been renamed once between
// versions (gmp-placeselect -> gmp-select). An unpinned loader means a booking
// form that silently stops capturing addresses one Tuesday morning.
const MAPS_VERSION = '3.64'

// Tracks whether the bootstrap has been installed in this document. The
// injected snippet also guards itself (it warns and no-ops on a second call),
// but this avoids relying on that and keeps the console clean.
let bootstrapInstalled = false

// Shared promise for callers that just want "Maps is ready".
let readyPromise = null

// Google's official inline bootstrap loader (loading=async). Defines
// google.maps.importLibrary synchronously; the API itself is fetched lazily on
// the first importLibrary() call, and that fetch is memoised internally, so
// concurrent importLibrary() calls share one network request rather than
// injecting a second script tag.
function installBootstrap() {
  if (bootstrapInstalled) {
    return
  }

  // Already present — another bundle, a previous render, or a stale copy of the
  // old inline loader. Adopt it rather than installing a second one.
  if (window.google?.maps?.importLibrary) {
    bootstrapInstalled = true
    return
  }

  ;((g) => {
    var h,
      a,
      k,
      p = 'The Google Maps JavaScript API',
      c = 'google',
      l = 'importLibrary',
      q = '__ib__',
      m = document,
      b = window
    b = b[c] || (b[c] = {})
    var d = b.maps || (b.maps = {}),
      r = new Set(),
      e = new URLSearchParams(),
      u = () =>
        h ||
        (h = new Promise(async (f, n) => {
          await (a = m.createElement('script'))
          e.set('libraries', [...r] + '')
          for (k in g)
            e.set(k.replace(/[A-Z]/g, (t) => '_' + t[0].toLowerCase()), g[k])
          e.set('callback', c + '.maps.' + q)
          a.src = `https://maps.${c}apis.com/maps/api/js?` + e
          d[q] = f
          a.onerror = () => (h = n(Error(p + ' could not load.')))
          a.nonce = m.querySelector('script[nonce]')?.nonce || ''
          m.head.append(a)
        }))
    d[l]
      ? console.warn(p + ' only loads once. Ignoring:', g)
      : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)))
  })({ key: GOOGLE_MAPS_API_KEY, v: MAPS_VERSION })

  bootstrapInstalled = true
}

// Loads a Maps library and resolves with it, e.g.
//   const { Map } = await importMapsLibrary('maps')
//   const { AdvancedMarkerElement } = await importMapsLibrary('marker')
//   const { PlaceAutocompleteElement } = await importMapsLibrary('places')
//
// Requesting several libraries in one Promise.all is fine — the underlying
// script fetch is shared. Each caller should request exactly the libraries it
// uses; asking for extras inflates the payload for everyone.
export function importMapsLibrary(name) {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('importMapsLibrary called outside the browser'),
    )
  }

  installBootstrap()

  return window.google.maps.importLibrary(name)
}

// Resolves once the Maps API is loaded and ready. For callers that need to know
// the API is available without needing a specific library in hand. Shared
// across concurrent callers.
//
// Note this pulls the 'core' library. Components that already import a specific
// library (maps, marker, places) should call importMapsLibrary directly instead
// — awaiting that is sufficient and avoids requesting a library they do not use.
export function loadMaps() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('loadMaps called outside the browser'))
  }

  if (!readyPromise) {
    readyPromise = importMapsLibrary('core').then(() => window.google.maps)
  }

  return readyPromise
}
