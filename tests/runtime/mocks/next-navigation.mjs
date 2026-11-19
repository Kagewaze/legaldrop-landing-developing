// Adopted, test-only, from the fresh-context D7c review runtime harness.
// Mock of next/navigation: records navigations instead of performing them.
export function useRouter() {
  return {
    replace: (href) => globalThis.__T.redirects.push(href),
    push: (href) => globalThis.__T.redirects.push(href),
  }
}
export function usePathname() { return '/send/pay' }
export function useSearchParams() { return new URLSearchParams('') }
