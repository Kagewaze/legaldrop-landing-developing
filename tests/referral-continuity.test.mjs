import test from 'node:test'
import assert from 'node:assert/strict'
import { publicCapture, REFERRAL_COOKIE } from '../src/lib/referral-continuity.mjs'
test('accepts opaque reference with backend expiry', () => {
  const value = publicCapture(
    { sessionReference: 'a'.repeat(43), expiresAt: '2026-10-18T00:00:00Z', bookingPath: '/send' },
    0
  )
  assert.equal(value.reference.length, 43)
  assert.equal(REFERRAL_COOKIE, 'druppr_referral')
})
test('rejects IDs, expired sessions and arbitrary redirects', () => {
  for (const value of [
    { sessionReference: 'uuid' },
    { sessionReference: 'a'.repeat(43), expiresAt: '2000-01-01', bookingPath: '/send' },
    {
      sessionReference: 'a'.repeat(43),
      expiresAt: '2099-01-01',
      bookingPath: 'https://other.example',
    },
  ])
    assert.throws(() => publicCapture(value))
})
