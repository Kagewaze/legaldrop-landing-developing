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
    <section className="mx-auto max-w-[1200px] px-8 py-14">
      <div className="flex flex-wrap items-center justify-between gap-8 rounded-[22px] bg-brand-600 p-8 text-white sm:p-11">
        <div className="max-w-[560px]">
          <div className="text-[26px] font-extrabold tracking-[-0.02em] sm:text-[30px]">
            Become a driver
          </div>
          <div className="mt-2 text-[16px] leading-[1.5] opacity-85">
            Own your vehicle? Set your own hours, take medical and legal jobs
            once you are certified, and get paid weekly.
          </div>
        </div>

        <Link
          href={href}
          className="rounded-xl bg-white px-[30px] py-4 text-[16px] font-bold text-brand-600 transition-colors hover:bg-[#f2e9fa] hover:text-[#5d1f96]"
        >
          Start earning
        </Link>
      </div>
    </section>
  )
}
