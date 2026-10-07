// Module resolution hook so node --test can import a route handler that reads cookies through
// "next/headers". Node built-ins only: no bundler, no new dependency, and no change to any
// production file. Registered alongside module-alias-hooks.mjs, which resolves the "@/" alias.
const STUB = new URL('./next-headers-stub.mjs', import.meta.url).href

export function resolve(specifier, context, next) {
  if (specifier === 'next/headers') {
    return next(STUB, context)
  }

  return next(specifier, context)
}
