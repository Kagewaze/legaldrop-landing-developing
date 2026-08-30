import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  customerTrackingPath,
  normalizeTrackingCode,
} from '../src/lib/home-tracking.mjs'

const readSource = (relativePath) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8')

const COMPONENT = readSource('../src/components/home/HomeTrackingBar.jsx')
const HOMEPAGE = readSource('../src/app/(main)/page.jsx')

test('normalizes only surrounding whitespace and letter case', () => {
  assert.equal(normalizeTrackingCode('  ab12cd34  '), 'AB12CD34')
  assert.equal(normalizeTrackingCode(' ab 12 '), 'AB 12')
  assert.equal(normalizeTrackingCode('   '), '')
})

test('builds a safely encoded consumer tracking route', () => {
  assert.equal(customerTrackingPath(' ab/12?# '), '/track/AB%2F12%3F%23')
  assert.equal(customerTrackingPath(' ab 12 '), '/track/AB%2012')
  assert.equal(customerTrackingPath('   '), null)
})

test('renders an accessible native tracking form with inline validation', () => {
  assert.match(COMPONENT, />\s*Track Your Package\s*</)
  assert.match(COMPONENT, /<form[\s\S]*onSubmit=\{handleSubmit\}/)
  assert.match(COMPONENT, /<input[\s\S]*name="trackingCode"/)
  assert.match(COMPONENT, /<button[\s\S]*type="submit"/)
  assert.match(COMPONENT, /aria-describedby=\{error \? errorId : undefined\}/)
  assert.match(COMPONENT, /role="alert"/)
  assert.match(COMPONENT, /min-h-11/)
  assert.match(COMPONENT, /text-base/)
})

test('empty submission does not navigate and reports an inline error', () => {
  const emptyGuard = COMPONENT.indexOf('if (!destination)')
  const errorUpdate = COMPONENT.indexOf("setError('Enter a tracking code", emptyGuard)
  const navigation = COMPONENT.indexOf('router.push(destination)')

  assert.ok(emptyGuard >= 0)
  assert.ok(errorUpdate > emptyGuard)
  assert.ok(navigation > errorUpdate)
  assert.match(COMPONENT.slice(emptyGuard, navigation), /return/)
})

test('submission only navigates and performs no tracking API preflight', () => {
  assert.match(COMPONENT, /router\.push\(destination\)/)
  assert.doesNotMatch(COMPONENT, /fetch\s*\(/)
  assert.doesNotMatch(COMPONENT, /axios|\/api\/|track-partner|trackingToken/)
})

test('homepage places the tracking bar between hero and operational proof', () => {
  const hero = HOMEPAGE.indexOf('<HeroNetwork />')
  const tracking = HOMEPAGE.indexOf('<HomeTrackingBar />')
  const proof = HOMEPAGE.indexOf('<OperationalProof />')

  assert.ok(hero >= 0)
  assert.ok(tracking > hero)
  assert.ok(proof > tracking)
})
