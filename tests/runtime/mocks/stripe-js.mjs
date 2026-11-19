// Adopted, test-only, from the fresh-context D7c review runtime harness.
// Mock of @stripe/stripe-js. A stable fake whose behaviour is driven per scenario through
// globalThis.__T (retrieve / confirm handlers). Synthetic ids only; no key is real.
export const fakeStripe = {
  async retrievePaymentIntent(clientSecret) {
    globalThis.__T.retrieveCalls.push(clientSecret)
    return globalThis.__T.retrieve(clientSecret)
  },
  async confirmPayment(options) {
    globalThis.__T.confirmCalls.push(options?.confirmParams ?? null)
    return globalThis.__T.confirm(options)
  },
}

export async function loadStripe(key) {
  globalThis.__T.loadStripeCalls.push(key)
  return fakeStripe
}
