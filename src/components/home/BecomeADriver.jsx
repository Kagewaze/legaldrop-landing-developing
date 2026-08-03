import Link from 'next/link'

import { ROUTES } from '@/lib/navigation'

// Driver recruitment band.

export function BecomeADriver() {
  // The driver signup flow does not exist yet. Until ROUTES.becomeADriver goes
  // live the CTA routes to the contact page, which is a real page staffed by
  // real people — a would-be driver who lands there can still reach the
  // business. Swap the target, not the copy, when signup ships.
  const href = ROUTES.becomeADriver.live
    ? ROUTES.becomeADriver.href
    : '/contact-us'

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
      <div className="flex flex-wrap items-center justify-between gap-8 rounded-card bg-brand-600 p-8 text-white sm:p-11">
        <div className="max-w-[560px]">
          <div className="font-display text-3xl font-bold">Become a driver</div>
          <div className="mt-2 text-base opacity-85">
            Own your vehicle? Set your own hours, take medical and legal jobs
            once you are certified, and get paid weekly.
          </div>
        </div>

        {/* White ring on a brand-600 ground — the header's inversion of the site
            focus recipe, for the same reason: brand-600 on brand-600 is
            invisible. */}
        <Link
          href={href}
          className="rounded-control bg-white px-[30px] py-4 text-base font-semibold text-brand-600 transition-colors hover:bg-[#f2e9fa] hover:text-[#5d1f96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
        >
          Start earning
        </Link>
      </div>
    </section>
  )
}
