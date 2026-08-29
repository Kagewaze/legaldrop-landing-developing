import assert from 'node:assert/strict'
import test from 'node:test'

import { subscribeMapsAuthFailure } from '../src/lib/maps-auth.mjs'

test('Maps auth failure notifies multiple subscribers and supports unsubscribe', () => {
  const originalWindow = globalThis.window
  globalThis.window = {}
  const calls = []

  try {
    const unsubscribeFirst = subscribeMapsAuthFailure(() => calls.push('first'))
    const unsubscribeSecond = subscribeMapsAuthFailure(() => calls.push('second'))

    globalThis.window.gm_authFailure()
    assert.deepEqual(calls, ['first', 'second'])

    unsubscribeFirst()
    globalThis.window.gm_authFailure()
    assert.deepEqual(calls, ['first', 'second', 'second'])

    unsubscribeSecond()
    assert.equal(globalThis.window.gm_authFailure, undefined)
  } finally {
    globalThis.window = originalWindow
  }
})

test('Maps auth failure preserves and restores an existing callback', () => {
  const originalWindow = globalThis.window
  const calls = []
  const previous = () => calls.push('previous')
  globalThis.window = { gm_authFailure: previous }

  try {
    const unsubscribe = subscribeMapsAuthFailure(() => calls.push('subscriber'))

    globalThis.window.gm_authFailure()
    assert.deepEqual(calls, ['previous', 'subscriber'])

    unsubscribe()
    assert.equal(globalThis.window.gm_authFailure, previous)
  } finally {
    globalThis.window = originalWindow
  }
})

test('Maps auth subscription is inert during server rendering', () => {
  const originalWindow = globalThis.window
  delete globalThis.window

  try {
    const unsubscribe = subscribeMapsAuthFailure(() => {
      throw new Error('must not subscribe without a browser')
    })
    assert.doesNotThrow(unsubscribe)
  } finally {
    globalThis.window = originalWindow
  }
})
