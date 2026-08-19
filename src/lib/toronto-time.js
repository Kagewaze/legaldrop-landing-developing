// Toronto wall-clock <-> absolute instant.
//
// ⚠️ WHY THIS EXISTS AND WHY IT IS NOT `new Date(localString)`.
//
// A customer scheduling a pickup picks a Toronto date and time. The backend needs
// ONE absolute instant (ISO-8601 with an offset) because it stores timestamptz and
// computes a dispatch delay from it. Those are different things, and the naive
// conversions are all wrong in a way that only shows up months later:
//
//   new Date('2030-07-10T18:30')      reads the BROWSER's timezone. A customer in
//                                     Vancouver booking a Toronto pickup would send
//                                     an instant three hours out.
//   '...T18:30:00-05:00' hardcoded    correct in January, one hour wrong from March
//                                     to November. Toronto is -05:00 (EST) in winter
//                                     and -04:00 (EDT) in summer.
//
// So the offset is never assumed: it is asked for, per date, via Intl — which knows
// the real DST rules. No dependency is added; Intl is the platform's timezone
// database.

export const DELIVERY_TIME_ZONE = 'America/Toronto'

// What Toronto's UTC offset actually is at a given instant, in milliseconds.
// Positive means ahead of UTC; Toronto is always negative.
function zoneOffsetMs(utcMs) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DELIVERY_TIME_ZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs))

  const at = {}
  parts.forEach((part) => {
    at[part.type] = part.value
  })

  // Intl renders midnight as hour 24 in some engines; normalise it.
  const hour = Number(at.hour) % 24

  const wallAsIfUtc = Date.UTC(
    Number(at.year),
    Number(at.month) - 1,
    Number(at.day),
    hour,
    Number(at.minute),
    Number(at.second),
  )

  return wallAsIfUtc - utcMs
}

// Toronto wall-clock fields -> the absolute instant they name.
//
// TWO PASSES, DELIBERATELY. The offset depends on the instant, and the instant is
// what we are solving for. One pass is wrong for times near a DST boundary, because
// the first guess can land on the other side of the transition and pick up the wrong
// offset. Re-deriving the offset from the corrected guess settles it.
//
// month is 1-12.
export function torontoWallTimeToInstant({ year, month, day, hour, minute }) {
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0, 0)

  let instant = naive - zoneOffsetMs(naive)
  instant = naive - zoneOffsetMs(instant)

  return new Date(instant)
}

// 'YYYY-MM-DD' + 'HH:mm' (what <input type="date"> and <input type="time"> produce)
// -> ISO instant string with an offset, or null when either part is missing or
// malformed. The caller decides what to do about null; this never guesses.
export function torontoFieldsToIso(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue)
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue)
  if (!dateMatch || !timeMatch) return null

  const instant = torontoWallTimeToInstant({
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  })

  if (Number.isNaN(instant.getTime())) return null

  // toISOString gives the Z form, which is an explicit offset and exactly what the
  // backend's IsFutureInstant validator requires.
  return instant.toISOString()
}

// Today in Toronto as 'YYYY-MM-DD', for the date input's `min`. Deliberately the
// delivery city's date, not the browser's — a customer booking from Vancouver at
// 10pm must not be offered a date Toronto has already left behind.
export function torontoTodayIso(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DELIVERY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const at = {}
  parts.forEach((part) => {
    at[part.type] = part.value
  })

  return `${at.year}-${at.month}-${at.day}`
}

// Human-readable confirmation of what was chosen, in Toronto terms — e.g.
// "Fri, Jan 10 at 6:30 p.m." The zone is stated separately in the UI rather than
// baked in here.
export function formatTorontoInstant(iso) {
  if (!iso) return ''

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DELIVERY_TIME_ZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

// Is this instant still in the future? The backend rejects a past pickUpTime, so the
// UI must not let one be submitted.
export function isFutureInstant(iso, now = new Date()) {
  if (!iso) return false
  const parsed = Date.parse(iso)
  return !Number.isNaN(parsed) && parsed > now.getTime()
}
