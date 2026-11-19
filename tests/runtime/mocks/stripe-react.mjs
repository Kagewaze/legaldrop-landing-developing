// Adopted, test-only, from the fresh-context D7c review runtime harness.
// Mock of @stripe/react-stripe-js. No Stripe code is loaded and nothing reaches Stripe.
// useStripe/useElements return the review's controllable fake (see stripe-js.mjs).
import { createElement, Fragment } from 'react'
import { fakeStripe } from './stripe-js.mjs'

export function Elements({ children, options }) {
  globalThis.__T.elementsOptions.push(options)
  return createElement(Fragment, null, children)
}
export function PaymentElement() {
  return createElement('div', { 'data-fake': 'payment-element' })
}
export function useStripe() { return fakeStripe }
export function useElements() { return { fake: 'elements' } }
