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
