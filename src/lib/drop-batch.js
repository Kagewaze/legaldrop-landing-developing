import { API_BASE_URL } from '@/lib/config'

// The public DropBatch trip board.
//
// ⚠️ THIS ENDPOINT IS DELIBERATELY UNAUTHENTICATED AND DELIBERATELY NARROW.
// GET /drop-batch/public/trips returns a positive-allowlist projection: route
// cities, departure date/window, vehicle, package constraints and remaining
// capacity. It carries NO poster identity, NO coordinates, NO addresses, NO
// booking or message data, NO price — and NO trip id.
//
// The missing id is not an oversight. A public card therefore cannot link to a
// trip, book it, or message anyone: those are authenticated acts that live in
// the app. Do not add "View trip" or "Book" here until a public-safe trip
// reference exists.
//
// Everything else on the board — which trips are available at all — is decided
// by the backend, which serves this from the SAME query as the authenticated
// mobile board. The web must never re-implement availability.

// ⚠️ A PRODUCT LOCATION, NOT THE VISITOR'S.
//
// The page must be useful on first paint without asking for geolocation, so the
// default query is centred on downtown Toronto. These coordinates are not
// invented here: 43.6532, -79.3832 is the Toronto origin the backend's own
// DropBatch board spec uses (legal_drop_be/src/modules/dropBatch/
// dropBatch.board.spec.ts:142, and again in googlemaps.osrm-timeout.spec.ts:16).
//
// Do NOT replace this with navigator.geolocation on load — a permission prompt
// the visitor did not ask for is exactly what section 15 of the brief forbids,
// and the board is meant to work anonymously.
export const DEFAULT_ORIGIN = {
  latitude: 43.6532,
  longitude: -79.3832,
  label: 'Toronto',
}

// The backend validates 500..50000 metres and rejects anything outside it. 50 km
// is the maximum, chosen so an anonymous first view shows the widest legitimate
// picture of the GTA rather than an artificially thin one.
export const DEFAULT_RADIUS_METRES = 50000

// Shape returned by the public projection. Declared for the reader — there is
// deliberately no `id` here.
//   posterTier              'user' | 'driver'
//   originCity              string
//   destinationCity         string
//   departureDate           ISO date
//   departureWindowStart    'HH:MM:SS'
//   departureWindowEnd      'HH:MM:SS'
//   vehicle                 string
//   maxPackageSize          string
//   acceptsFragile          boolean
//   packageSpaceRemaining   number
//   seatsRemaining          number
//   trunkRemaining          number

export async function fetchPublicTrips({
  latitude = DEFAULT_ORIGIN.latitude,
  longitude = DEFAULT_ORIGIN.longitude,
  radiusMetres = DEFAULT_RADIUS_METRES,
  destinationCity = '',
  signal,
} = {}) {
  const params = new URLSearchParams({
    originLatitude: String(latitude),
    originLongitude: String(longitude),
    radiusMetres: String(radiusMetres),
  })

  // Omitted when blank — a blank filter would narrow the board to nothing.
  // Backend matches destinationCity case-insensitively but EXACTLY; this is not
  // a fuzzy search and the UI must not imply otherwise.
  if (destinationCity && destinationCity.trim()) {
    params.set('destinationCity', destinationCity.trim())
  }

  const response = await fetch(
    `${API_BASE_URL}/drop-batch/public/trips?${params.toString()}`,
    {
      signal,
      // ⚠️ NEVER CACHE THE BOARD. Trips are posted and filled continuously and
      // the backend drops anything departing before today, so a cached answer
      // can claim capacity that is gone or an empty board that is not. Showing
      // a wrong board is worse than one extra query against a single indexed
      // PostGIS lookup. Paired with `dynamic = 'force-dynamic'` on the page.
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error(`Trip board request failed (${response.status})`)
  }

  const payload = await response.json()

  // Backend wraps success as { success, data, message }.
  const trips = payload?.data

  return Array.isArray(trips) ? trips.map(toPublicTrip) : []
}

// ⚠️ SECOND ALLOWLIST, ON PURPOSE. The backend already projects to these twelve
// fields, so this is defence in depth rather than a fix for a known leak — but it
// is not redundant, because of how these objects travel:
//
// page.jsx is a server component that hands trips to <TripBoard>, a CLIENT
// component. Next serializes EVERY prop crossing that boundary into the RSC
// flight payload embedded in the HTML — whether or not TripCard renders it. So
// any field the API adds would be published to the browser silently, invisible
// on screen and readable in view-source.
//
// Proven, not assumed: a stub returning hostile extra fields (trip id, poster
// user id, driver id, booking id, name, email, phone, address, plate, messages,
// senderPays/driverEarns/platformFee, raw origin/destination coordinates) put
// every one of them into the served HTML before this projection existed.
//
// The web must therefore not inherit its privacy guarantee from the backend's
// discipline. Add a field here only when it is deliberately public.
const PUBLIC_TRIP_FIELDS = [
  'posterTier',
  'originCity',
  'destinationCity',
  'departureDate',
  'departureWindowStart',
  'departureWindowEnd',
  'vehicle',
  'maxPackageSize',
  'acceptsFragile',
  'packageSpaceRemaining',
  'seatsRemaining',
  'trunkRemaining',
]

function toPublicTrip(trip) {
  const safe = {}
  PUBLIC_TRIP_FIELDS.forEach((field) => {
    if (trip && field in trip) {
      safe[field] = trip[field]
    }
  })
  return safe
}

// 'HH:MM:SS' -> 'HH:MM'. Mobile renders the raw value; seconds are always :00 on
// a departure window and read as false precision on a marketing page. Display
// only — the underlying value is untouched.
export function formatWindow(start, end) {
  const trim = (t) => (typeof t === 'string' ? t.slice(0, 5) : '')
  const a = trim(start)
  const b = trim(end)
  if (!a || !b) return ''
  return `${a}–${b}`
}

// Matches mobile's moment(departureDate).format('ddd MMM D') — e.g. "Thu Jan 1".
export function formatDepartureDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

// ⚠️ MIRRORS MOBILE EXACTLY: only dimensions with space left are listed, and a
// fully-booked trip legitimately shows none. The board does not hide such trips
// (backend listTrips returns them), and the web must not invent a availability
// rule that disagrees with the app. See dropBatchBoardScreen.tsx:314.
export function capacityChips(trip) {
  const chips = []
  if (trip.packageSpaceRemaining > 0) {
    chips.push(`${trip.packageSpaceRemaining} package space`)
  }
  if (trip.seatsRemaining > 0) {
    chips.push(`${trip.seatsRemaining} seat${trip.seatsRemaining > 1 ? 's' : ''}`)
  }
  if (trip.trunkRemaining > 0) {
    chips.push(`${trip.trunkRemaining} trunk`)
  }
  return chips
}

// Vehicle and size arrive as backend enums — 'sedan', 'suv', 'cargo_van',
// 'box_truck', 'medium'. Rendering them raw gives "cargo_van"; a blanket CSS
// `capitalize` gives "Cargo_van" and turns "up to medium" into "Up To Medium".
// So the enum is humanised here, once, and the phrase around it is left alone.
//
// SUV stays uppercase because it is an initialism, not a word.
const VEHICLE_LABELS = {
  sedan: 'Sedan',
  suv: 'SUV',
  minivan: 'Minivan',
  cargo_van: 'Cargo van',
  box_truck: 'Box truck',
}

export function formatVehicle(value) {
  if (!value) return ''
  return VEHICLE_LABELS[value] ?? String(value).replace(/_/g, ' ')
}

// Sizes are plain words ('small' | 'medium' | 'large'); they read correctly in
// lowercase inside "up to medium" and must NOT be title-cased.
export function formatPackageSize(value) {
  if (!value) return ''
  return String(value).replace(/_/g, ' ')
}
