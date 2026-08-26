import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TERMINAL_STATUSES,
  isTerminalStatus,
  partnerTrackingIdentity,
  startTrackingPoll,
  trackingPollUrl,
} from '../src/lib/tracking.mjs'

const API = 'https://api.example.test/api'
const TRACK_ENDPOINT = `${API}/public/track`
const TRACK_PARTNER_ENDPOINT = `${API}/public/track-partner`
const POLL_INTERVAL_MS = 6000

// --- deterministic harness -------------------------------------------------

// Lets every already-resolved promise continuation run before we assert.
const flush = () => new Promise((resolve) => setImmediate(resolve))

// Virtual clock. Nothing fires unless the test advances it, so "did a second
// request start?" is a decidable question rather than a timing race.
function createClock() {
  let now = 0
  let nextId = 1
  const scheduled = new Map()

  return {
    timers: {
      setTimeout(fn, ms) {
        const id = nextId++
        scheduled.set(id, { fn, at: now + ms })
        return id
      },
      clearTimeout(id) {
        scheduled.delete(id)
      },
    },
    get pendingTimers() {
      return scheduled.size
    },
    async advance(ms) {
      const target = now + ms

      for (let guard = 0; ; guard += 1) {
        assert.ok(guard < 1000, 'runaway timer loop')

        const due = [...scheduled.entries()]
          .filter(([, timer]) => timer.at <= target)
          .sort((a, b) => a[1].at - b[1].at)[0]

        if (!due) {
          break
        }

        const [id, timer] = due
        scheduled.delete(id)
        now = timer.at
        timer.fn()
        await flush()
      }

      now = target
      await flush()
    },
  }
}

// fetch stub whose responses are resolved by hand, so completion order is
// chosen by the test rather than by the runtime.
function createFetchStub() {
  const calls = []

  return {
    calls,
    fetchImpl(url, init) {
      let settle
      const promise = new Promise((resolve) => {
        settle = resolve
      })

      calls.push({
        url,
        init,
        respond(data) {
          settle({ ok: true, json: async () => ({ success: true, data }) })
          return flush()
        },
      })

      return promise
    },
  }
}

function collector() {
  const committed = []
  return { committed, onData: (data) => committed.push(data) }
}

// --- TEST A - partner credential separation --------------------------------

test('A: partner polling uses the route token, never the payload display code', async () => {
  const routeTrackingToken = 'TOKEN_ABC'
  const payload = { trackingCode: 'CODE123', status: 'ongoing' }

  const { pollCredential, displayCode } = partnerTrackingIdentity({
    routeTrackingToken,
    payload,
  })

  // The credential is the opaque route token; the short code is display only.
  assert.equal(pollCredential, 'TOKEN_ABC')
  assert.equal(displayCode, 'CODE123')

  // And it survives all the way into the request the poller actually issues.
  const clock = createClock()
  const fetchStub = createFetchStub()
  const { onData } = collector()

  const stop = startTrackingPoll({
    url: trackingPollUrl(TRACK_PARTNER_ENDPOINT, pollCredential),
    intervalMs: POLL_INTERVAL_MS,
    onData,
    fetchImpl: fetchStub.fetchImpl,
    timers: clock.timers,
  })

  await clock.advance(POLL_INTERVAL_MS)
  stop()

  assert.equal(fetchStub.calls.length, 1)
  assert.equal(fetchStub.calls[0].url, `${TRACK_PARTNER_ENDPOINT}/TOKEN_ABC`)
  assert.ok(!fetchStub.calls[0].url.includes('CODE123'))
})

test('A: a payload with no trackingCode never falls back to the token', () => {
  const { pollCredential, displayCode } = partnerTrackingIdentity({
    routeTrackingToken: 'TOKEN_ABC',
    payload: { status: 'ongoing' },
  })

  assert.equal(pollCredential, 'TOKEN_ABC')
  // null, not the token: the opaque credential is not a display value.
  assert.equal(displayCode, null)
})

// --- TEST B - stale / out-of-order responses cannot regress state ----------

test('B: a slow request never overlaps a later one (single flight)', async () => {
  const clock = createClock()
  const fetchStub = createFetchStub()
  const { committed, onData } = collector()

  const stop = startTrackingPoll({
    url: trackingPollUrl(TRACK_ENDPOINT, 'ABC123'),
    intervalMs: POLL_INTERVAL_MS,
    onData,
    fetchImpl: fetchStub.fetchImpl,
    timers: clock.timers,
  })

  await clock.advance(POLL_INTERVAL_MS)
  assert.equal(fetchStub.calls.length, 1, 'first request started')

  // Ten intervals pass while request A hangs. Under the old setInterval
  // poller this launched ten more overlapping requests.
  await clock.advance(POLL_INTERVAL_MS * 10)
  assert.equal(
    fetchStub.calls.length,
    1,
    'no second request may start while the first is in flight',
  )
  assert.equal(clock.pendingTimers, 0, 'no tick is armed while a poll is open')

  await fetchStub.calls[0].respond({ status: 'assigned', driverLocation: null })
  assert.equal(fetchStub.calls.length, 1)

  // Only once A settled is the next tick armed.
  await clock.advance(POLL_INTERVAL_MS)
  assert.equal(fetchStub.calls.length, 2)
  await fetchStub.calls[1].respond({
    status: 'ongoing',
    driverLocation: { lat: 43.7, lng: -79.4 },
  })

  stop()

  assert.deepEqual(
    committed.map((data) => data.status),
    ['assigned', 'ongoing'],
    'responses commit in issue order',
  )
})

test('B: a superseded request cannot commit after a newer one', async () => {
  const clock = createClock()
  const fetchStub = createFetchStub()
  const { committed, onData } = collector()

  const options = {
    url: trackingPollUrl(TRACK_ENDPOINT, 'ABC123'),
    intervalMs: POLL_INTERVAL_MS,
    onData,
    fetchImpl: fetchStub.fetchImpl,
    timers: clock.timers,
  }

  // Loop 1 issues request A, then the effect is torn down and restarted - what
  // happens on every status change and on a remount.
  const stopFirst = startTrackingPoll(options)
  await clock.advance(POLL_INTERVAL_MS)
  const requestA = fetchStub.calls[0]
  stopFirst()

  // Loop 2 issues request B, which returns the NEWER state first.
  const stopSecond = startTrackingPoll(options)
  await clock.advance(POLL_INTERVAL_MS)
  const requestB = fetchStub.calls[1]
  await requestB.respond({
    status: 'ongoing',
    driverLocation: { lat: 43.7, lng: -79.4 },
  })

  // A now resolves, late, with the OLDER state.
  await requestA.respond({ status: 'assigned', driverLocation: null })

  stopSecond()

  assert.deepEqual(
    committed.map((data) => data.status),
    ['ongoing'],
    'the stale response must not commit',
  )
})

// --- TEST C - cleanup -------------------------------------------------------

test('C: stop() clears the timer, aborts the in-flight request, and blocks commits', async () => {
  const clock = createClock()
  const fetchStub = createFetchStub()
  const { committed, onData } = collector()

  const stop = startTrackingPoll({
    url: trackingPollUrl(TRACK_ENDPOINT, 'ABC123'),
    intervalMs: POLL_INTERVAL_MS,
    onData,
    fetchImpl: fetchStub.fetchImpl,
    timers: clock.timers,
  })

  assert.equal(clock.pendingTimers, 1, 'a tick is armed at start')

  await clock.advance(POLL_INTERVAL_MS)
  const inFlight = fetchStub.calls[0]
  assert.equal(inFlight.init.signal.aborted, false)

  stop()

  assert.equal(inFlight.init.signal.aborted, true, 'in-flight request aborted')

  // A response that arrives anyway after teardown must not commit.
  await inFlight.respond({ status: 'ongoing' })
  assert.deepEqual(committed, [], 'no state commit after stop')

  // And no further request is ever issued.
  await clock.advance(POLL_INTERVAL_MS * 10)
  assert.equal(fetchStub.calls.length, 1)
  assert.equal(clock.pendingTimers, 0, 'no timer left behind')
})

test('C: an armed timer is cleared when stop() runs before the first tick', async () => {
  const clock = createClock()
  const fetchStub = createFetchStub()

  const stop = startTrackingPoll({
    url: trackingPollUrl(TRACK_ENDPOINT, 'ABC123'),
    intervalMs: POLL_INTERVAL_MS,
    onData: () => assert.fail('must not poll'),
    fetchImpl: fetchStub.fetchImpl,
    timers: clock.timers,
  })

  stop()
  stop() // idempotent

  assert.equal(clock.pendingTimers, 0)
  await clock.advance(POLL_INTERVAL_MS * 5)
  assert.equal(fetchStub.calls.length, 0)
})

test('C: a failed request keeps the last known good state and retries', async () => {
  const clock = createClock()
  const { committed, onData } = collector()
  const attempts = []

  const stop = startTrackingPoll({
    url: trackingPollUrl(TRACK_ENDPOINT, 'ABC123'),
    intervalMs: POLL_INTERVAL_MS,
    onData,
    fetchImpl: async (url) => {
      attempts.push(url)

      if (attempts.length === 1) {
        throw new Error('network down')
      }

      if (attempts.length === 2) {
        return { ok: false, json: async () => ({}) }
      }

      return {
        ok: true,
        json: async () => ({ success: true, data: { status: 'ongoing' } }),
      }
    },
    timers: clock.timers,
  })

  await clock.advance(POLL_INTERVAL_MS * 3)
  stop()

  assert.equal(attempts.length, 3, 'each failure is followed by another attempt')
  assert.deepEqual(
    committed.map((data) => data.status),
    ['ongoing'],
    'neither the throw nor the non-ok response committed anything',
  )
})

// --- TEST D - terminal status ----------------------------------------------

test('D: the terminal status set is exactly the four backend terminal states', () => {
  assert.deepEqual(TERMINAL_STATUSES, [
    'delivered',
    'cancelled',
    'failed',
    'refunded',
  ])

  for (const status of ['delivered', 'cancelled', 'failed', 'refunded']) {
    assert.equal(isTerminalStatus(status), true, `${status} is terminal`)
  }

  for (const status of [
    'pending',
    'assigned',
    'ongoing',
    'awaiting_seller_confirmation',
    'awaiting_handoff',
    undefined,
  ]) {
    assert.equal(isTerminalStatus(status), false, `${status} is not terminal`)
  }
})

test('D: a terminal status stops polling; a non-terminal one keeps it running', async () => {
  // Mirrors the guard both tracking components apply around startTrackingPoll.
  const run = async (status) => {
    const clock = createClock()
    const fetchStub = createFetchStub()

    const stop = isTerminalStatus(status)
      ? null
      : startTrackingPoll({
          url: trackingPollUrl(TRACK_ENDPOINT, 'ABC123'),
          intervalMs: POLL_INTERVAL_MS,
          onData: () => {},
          fetchImpl: fetchStub.fetchImpl,
          timers: clock.timers,
        })

    await clock.advance(POLL_INTERVAL_MS)
    stop?.()

    return fetchStub.calls.length
  }

  for (const status of TERMINAL_STATUSES) {
    assert.equal(await run(status), 0, `${status} must not poll`)
  }

  for (const status of ['pending', 'assigned', 'ongoing', 'awaiting_handoff']) {
    assert.equal(await run(status), 1, `${status} must keep polling`)
  }
})

// --- TEST E - customer route regression ------------------------------------

test('E: the customer route polls /public/track with the short code', async () => {
  const clock = createClock()
  const fetchStub = createFetchStub()
  const { committed, onData } = collector()

  const stop = startTrackingPoll({
    url: trackingPollUrl(TRACK_ENDPOINT, 'ABC123'),
    intervalMs: POLL_INTERVAL_MS,
    onData,
    fetchImpl: fetchStub.fetchImpl,
    timers: clock.timers,
  })

  await clock.advance(POLL_INTERVAL_MS)
  await fetchStub.calls[0].respond({ status: 'ongoing' })
  stop()

  assert.equal(fetchStub.calls[0].url, `${TRACK_ENDPOINT}/ABC123`)
  assert.ok(!fetchStub.calls[0].url.includes('track-partner'))
  assert.equal(fetchStub.calls[0].init.cache, 'no-store')
  assert.deepEqual(
    committed.map((data) => data.status),
    ['ongoing'],
  )
})

test('E: the poll interval is unchanged at 6s on both surfaces', async () => {
  const clock = createClock()
  const fetchStub = createFetchStub()

  const stop = startTrackingPoll({
    url: trackingPollUrl(TRACK_ENDPOINT, 'ABC123'),
    intervalMs: POLL_INTERVAL_MS,
    onData: () => {},
    fetchImpl: fetchStub.fetchImpl,
    timers: clock.timers,
  })

  await clock.advance(POLL_INTERVAL_MS - 1)
  assert.equal(
    fetchStub.calls.length,
    0,
    'nothing polls before the interval elapses',
  )

  await clock.advance(1)
  assert.equal(fetchStub.calls.length, 1)

  stop()
})
