// Stands in for Next's "next/headers" so node --test can run a route handler outside a request
// scope. Only the one call the referral quote proxy makes is implemented: cookies().get(name).
let jar = new Map()

export function setCookies(entries = {}) {
  jar = new Map(Object.entries(entries))
}

export function cookies() {
  return {
    get: (name) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
  }
}
