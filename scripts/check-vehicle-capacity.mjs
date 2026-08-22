#!/usr/bin/env node
// Proves the vehicle package-capacity rule, and that it is still wired in.
//
// WHY THIS EXISTS. A standard car carries at most 5 packages. The authority for that is the
// API repo (src/utils/vehicle.utils.ts), which refuses an over-capacity car on quote-itemized,
// get-fee, order creation and order groups alike — so nothing here can let a bad booking
// through. What the website owes the customer is the same answer BEFORE they pick a vehicle
// and start typing card details, rather than after the card is charged.
//
// This repo has no test runner and one is not worth adding for this, so the check is split in
// two, matching what can actually be proven without a DOM:
//
//   RUNTIME — the rule itself (src/components/send/vehicles.js) is pure, imports nothing, and
//   is executed here for real. Its source is evaluated straight from disk via a data: URL, so
//   what runs is the committed file, not a copy that can drift.
//
//   WIRING — the rule is only useful where it is applied, and those call sites live in React
//   modules that cannot be imported without a bundler. They are asserted at the source level
//   instead. This is weaker than executing them, and deliberately so: it catches the failure
//   that actually happens — someone removes a call and the rule quietly stops applying —
//   without pretending to be a render test.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

const failures = []

function check(name, condition, detail = '') {
  if (condition) return
  failures.push(detail ? `${name}\n      ${detail}` : name)
}

function read(relativePath) {
  return readFileSync(join(SRC, relativePath), 'utf8')
}

// ── RUNTIME: the rule ───────────────────────────────────────────────────────
const vehiclesPath = join(SRC, 'components', 'send', 'vehicles.js')
const vehiclesSource = readFileSync(vehiclesPath, 'utf8')
const vehicles = await import(
  `data:text/javascript;base64,${Buffer.from(vehiclesSource).toString('base64')}`
)

const {
  VEHICLES,
  VEHICLE_PACKAGE_CAPACITY,
  packageCapacityRefusal,
  vehicleAfterPackageChange,
} = vehicles

// THE GUARD AGAINST INVENTED CAPACITIES. Only the car limit is founder-approved. Speculative
// maximums for the other classes (bike 2, suv 10, minivan 15, cargo van 30, box truck 999)
// exist in no source of truth, and adding one here would silently remove a vehicle the
// customer is entitled to book — the exact bug that made >10 packages look unserviceable.
check(
  'VEHICLE_PACKAGE_CAPACITY declares a limit for the car and nothing else',
  JSON.stringify(VEHICLE_PACKAGE_CAPACITY) === JSON.stringify({ car: 5 }),
  `found ${JSON.stringify(VEHICLE_PACKAGE_CAPACITY)}`
)

for (const n of [1, 2, 3, 4, 5]) {
  check(`car is available at ${n} package(s)`, packageCapacityRefusal('car', n) === null)
}

for (const n of [6, 7, 11, 12]) {
  check(`car is unavailable at ${n} packages`, packageCapacityRefusal('car', n) === 'Up to 5 packages')
}

check('the boundary is exactly 5 → 6', packageCapacityRefusal('car', 5) === null && packageCapacityRefusal('car', 6) !== null)

// >10 packages must not collapse the offering: every class without a capacity row stays
// offered at every count the stepper can reach.
for (const vehicle of VEHICLES) {
  if (vehicle.id === 'car') continue
  for (const n of [1, 6, 11, 12]) {
    check(
      `${vehicle.name} stays available at ${n} packages`,
      packageCapacityRefusal(vehicle.id, n) === null
    )
  }
}

// The larger classes specifically, by the id the picker uses ('cargo', not 'cargovan').
for (const id of ['minivan', 'cargo', 'boxtruck']) {
  check(`${id} is offered at 11 and 12 packages`, packageCapacityRefusal(id, 11) === null && packageCapacityRefusal(id, 12) === null)
}

// ── RUNTIME: the selection transitions ──────────────────────────────────────
check('5 → 6 clears a selected car', vehicleAfterPackageChange('car', 6) === null)
check('5 → 6 keeps a selected minivan', vehicleAfterPackageChange('minivan', 6) === 'minivan')
check('10 → 11 keeps a selected cargo van', vehicleAfterPackageChange('cargo', 11) === 'cargo')
check('a car at 5 survives untouched', vehicleAfterPackageChange('car', 5) === 'car')
check('no selection stays no selection', vehicleAfterPackageChange(null, 3) === null)

// 6 → 5 makes the car AVAILABLE again, but does not re-select it: nothing may put a vehicle
// back in the customer's cart that they did not choose.
check('6 → 5 makes the car selectable again', packageCapacityRefusal('car', 5) === null)
check('6 → 5 does not resurrect a cleared selection', vehicleAfterPackageChange(null, 5) === null)

// ── WIRING ──────────────────────────────────────────────────────────────────
const sendFlow = read('lib/send-flow.js')

check(
  'send-flow re-evaluates the vehicle whenever the package count changes',
  /setPackageCount[\s\S]{0,600}vehicleAfterPackageChange/.test(sendFlow),
  'setPackageCount must clear a vehicle the new count outgrew, in the SAME state update'
)
check(
  'send-flow refuses an over-capacity vehicle selection',
  /setVehicle[\s\S]{0,400}packageCapacityRefusal/.test(sendFlow),
  'setVehicle is the backstop for keyboard activation and restored sessions'
)
check(
  'send-flow re-checks the vehicle restored from sessionStorage',
  /function readStored[\s\S]{0,1200}vehicleAfterPackageChange/.test(sendFlow),
  'a record written before this rule existed can hold car + 12 packages'
)

const quotes = read('components/send/useVehicleQuotes.js')
check(
  'useVehicleQuotes does not price a vehicle that cannot take the load',
  /packageCapacityRefusal/.test(quotes),
  'an unfetched vehicle is what guarantees no stale fare survives the count change'
)
check(
  'useVehicleQuotes re-quotes when the package count changes',
  /inputKey[\s\S]{0,400}packageCount/.test(quotes),
  'packageCount must be part of the key the quote request is memoised on'
)

const picker = read('components/send/VehiclePicker.jsx')
check(
  'VehiclePicker disables an over-capacity vehicle',
  /packageCapacityRefusal/.test(picker) && /disabled=\{/.test(picker),
  'the card stays in place, disabled, rather than disappearing from the list'
)
check(
  'VehiclePicker cannot render a stale selected border on a disabled card',
  /isSelected\s*=\s*!overCapacity/.test(picker)
)
check(
  'VehiclePicker cannot render a stale price on a disabled card',
  /const quote = overCapacity \? null :/.test(picker)
)

const pay = read('app/send/pay/page.jsx')
check(
  'the payment step refuses to boot without a bookable vehicle',
  /packageCapacityRefusal[\s\S]{0,200}router\.replace/.test(pay),
  'this is the last gate before get-fee mints a real PaymentIntent'
)

const details = read('app/send/details/page.jsx')
check(
  'the details step passes the package count to the picker',
  /packageCount=\{flow\.packageCount\}/.test(details)
)
check(
  'the details step does not resolve a null vehicle to the car fallback',
  /flow\.vehicle \? vehicleById\(flow\.vehicle\) : null/.test(details),
  'vehicleById falls back to the car for an unknown id'
)

// ── Report ──────────────────────────────────────────────────────────────────
if (failures.length > 0) {
  console.error('Vehicle capacity check failed:\n')
  for (const failure of failures) console.error(`  ✗ ${failure}`)
  process.exit(1)
}

console.log('Vehicle capacity check passed: car capped at 5 packages, every other class uncapped.')
