import { BRAND } from '@/lib/config'

// "Why <brand>" — four value cards.
//
// Heading composes from BRAND.name, so it reads "Why LegalDrop" today and
// "Why Druppr" the moment that constant flips.

const REASONS = [
  {
    title: 'Same-day delivery',
    description: 'Most jobs collected within the hour.',
    icon: <span className="h-[14px] w-[14px] rounded-full border-2 border-white" />,
  },
  {
    title: 'Live tracking',
    description: 'A map link for you and your recipient.',
    icon: <span className="h-[4px] w-[14px] rounded-[2px] bg-white" />,
  },
  {
    title: 'TDG-certified drivers',
    description: 'Trained for medical and regulated goods.',
    icon: <span className="h-[12px] w-[12px] rotate-45 bg-white" />,
  },
  {
    title: 'Signature on delivery',
    description: 'Proof and photo on every drop-off.',
    icon: (
      <span className="mb-[3px] h-[10px] w-[14px] border-b-2 border-l-2 border-white" />
    ),
  },
]

export function WhyBrand() {
  return (
    <section className="mx-auto max-w-[1200px] px-8 pt-16">
      <h2 className="text-[30px] font-extrabold tracking-[-0.02em] text-[#17131c]">
        Why {BRAND.name}
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((reason) => (
          <div key={reason.title} className="rounded-2xl bg-[#faf7fd] p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-600">
              {reason.icon}
            </div>
            <div className="mt-4 text-[17px] font-bold text-[#17131c]">
              {reason.title}
            </div>
            <div className="mt-1.5 text-[14px] leading-[1.5] text-[#5f5868]">
              {reason.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
