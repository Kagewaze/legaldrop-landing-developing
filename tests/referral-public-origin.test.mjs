import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const route = readFileSync('src/app/r/[slug]/route.js', 'utf8')

test('referral redirects use the canonical public Druppr origin rather than an internal proxy URL', () => {
  assert.match(route, /new URL\('\/send', 'https:\/\/druppr\.ca'\)/)
  assert.doesNotMatch(route, /new URL\('\/send', request\.url\)/)
})
