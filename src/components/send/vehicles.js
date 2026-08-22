// Vehicle catalogue and the design-id → API-key mapping.
//
// THIS TABLE IS THE MAPPING BOUNDARY. The backend requires NORMALISED vehicle
// keys — lowercase, no underscores, no spaces. Sending an unnormalised key is
// either a 400 or, worse, a quote priced for the wrong vehicle class.
//
// The design's ids are not all the API's keys:
//   design 'cargo'  ->  API 'cargovan'    <- the one that bites
// and the design omits 'boxtruck' entirely, which the backend supports, so it
// is added here.
//
// `apiKey` is the ONLY value that may cross the network. `id` is for local
// state and React keys. Never send `id`.

export const VEHICLES = [
  {
    id: 'bike',
    apiKey: 'bike',
    name: 'Bike',
    description: 'Envelopes and small parcels',
    glyph: 'h-[4px] w-[16px] rounded-[2px]',
  },
  {
    id: 'car',
    apiKey: 'car',
    name: 'Car',
    description: 'Up to 3 boxes, most jobs',
    glyph: 'h-[9px] w-[16px] rounded-[3px]',
  },
  {
    id: 'suv',
    apiKey: 'suv',
    name: 'SUV',
    description: 'Bulkier items, extra room',
    glyph: 'h-[12px] w-[16px] rounded-[3px]',
  },
  {
    id: 'minivan',
    apiKey: 'minivan',
    name: 'Minivan',
    // Not "pallets" — a minivan cannot take a pallet. That belongs to the
    // cargo van and box truck below.
    description: 'Several boxes or a small furniture item',
    glyph: 'h-[13px] w-[18px] rounded-[3px]',
  },
  {
    // Design calls this 'cargo'. The API calls it 'cargovan'.
    id: 'cargo',
    apiKey: 'cargovan',
    name: 'Cargo van',
    description: 'Full loads and furniture',
    glyph: 'h-[15px] w-[20px] rounded-[2px]',
  },
  {
    // Not in the design. Supported by the backend, so offered here.
    // ⚠️ The description is written by us, not taken from the design or from
    // any product copy — confirm it before launch.
    id: 'boxtruck',
    apiKey: 'boxtruck',
    name: 'Box truck',
    description: 'Large or palletised freight',
    glyph: 'h-[17px] w-[22px] rounded-[2px]',
  },
]

export function vehicleById(id) {
  return VEHICLES.find((vehicle) => vehicle.id === id) ?? VEHICLES[1]
}

export function apiKeyFor(id) {
  return vehicleById(id).apiKey
}

// ── PACKAGE CAPACITY ────────────────────────────────────────────────────────
//
// A MIRROR OF THE BACKEND RULE, NOT A SECOND SOURCE OF TRUTH.
//
// The authority is src/utils/vehicle.utils.ts (VEHICLE_PACKAGE_CAPACITY) in the
// API repo, which refuses an over-capacity car on quote-itemized, get-fee, order
// creation and order groups alike. Nothing here can let a booking through that
// the backend would reject; this exists so the customer is told BEFORE they pick
// a vehicle and start typing card details, instead of after.
//
// ⚠️ ONE ROW, AND IT IS FOUNDER-APPROVED: a car carries at most 5 packages.
// Do NOT add speculative capacities for bike/suv/minivan/cargo van/box truck.
// There is no such rule in the backend, and inventing one here would hide a
// vehicle the customer is entitled to book — which is precisely the bug that
// made >10 packages look unserviceable. A vehicle absent from this table has no
// declared limit and must stay offered at every package count.
//
// KEYED BY apiKey, matching the backend table, so the two can be compared
// literally. Callers pass the local design id and this resolves it.
export const VEHICLE_PACKAGE_CAPACITY = {
  car: 5,
}

export function vehicleCapacityFor(id) {
  return VEHICLE_PACKAGE_CAPACITY[apiKeyFor(id)] ?? null
}

// null when the vehicle may take the load, otherwise a short label for the card.
//
// Deliberately stated as a capability ("Up to 5 packages") rather than as a
// failure: the vehicle is not broken and the trip is not impossible — the
// customer just needs a bigger one, and the number is the useful part.
export function packageCapacityRefusal(id, packageCount) {
  const limit = vehicleCapacityFor(id)

  if (limit === null) {
    return null
  }

  const count = Number(packageCount)

  if (!Number.isFinite(count) || count <= limit) {
    return null
  }

  return `Up to ${limit} packages`
}

// The selection rule the whole flow shares: a vehicle that cannot take the load
// must not stay selected. Returns the vehicle to keep, or null to force a fresh
// choice.
//
// It returns NULL rather than substituting the next size up. Silently moving
// someone onto a more expensive vehicle — and then charging them for it — is not
// a correction the customer asked for; the flow blocks and asks instead.
export function vehicleAfterPackageChange(id, packageCount) {
  if (!id) {
    return null
  }

  return packageCapacityRefusal(id, packageCount) ? null : id
}
