// Adopted, test-only, from the fresh-context D7c review runtime harness.
// Presentational stand-in for the real ViaLink (which pulls in marketing navigation).
import { createElement } from 'react'

export function ViaLink({ href, children, ...rest }) {
  return createElement('a', { href, ...rest }, children)
}
