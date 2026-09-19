import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const route = fs.readFileSync('src/app/api/referral/checkout/route.js', 'utf8')
const pay = fs.readFileSync('src/app/send/pay/page.jsx', 'utf8')
test('HttpOnly referral is injected only by same-origin server checkout proxy', () => {
  assert.match(route, /cookies\(\).*REFERRAL_COOKIE/s)
  assert.match(route, /referralSessionReference/)
  assert.doesNotMatch(pay, /druppr_referral|referralSessionReference/)
  assert.match(pay, /referralCheckoutFetch/)
})
test('proxy forwards bearer authentication and ordinary checkout without requiring referral', () => {
  assert.match(route, /Authorization: authorization/)
  assert.match(
    route,
    /reference[\s\S]*referralSessionReference: reference[\s\S]*: body/,
  )
})
