// Four-step explainer.

const STEPS = [
  {
    number: '01',
    title: 'Enter pickup and dropoff',
    description: 'Two addresses is all we need to start.',
  },
  {
    number: '02',
    title: 'See your price',
    description: 'Flat, upfront, from $8.00. No surprises.',
  },
  {
    number: '03',
    title: 'Pay online',
    // DEVIATION: the design says "Card, Apple Pay, or monthly invoicing."
    // Monthly invoicing is a partner-platform billing arrangement, not
    // something a consumer can choose at checkout — offering it here would
    // promise a payment method this flow does not have.
    description: 'Card, Apple Pay, or Google Pay.',
  },
  {
    number: '04',
    title: 'Track live',
    description: 'Watch the driver and share a link.',
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1200px] px-8 pt-16">
      <h2 className="text-[30px] font-extrabold tracking-[-0.02em] text-[#17131c]">
        How it works
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <div
            key={step.number}
            className={`border-t-[3px] pt-[18px] ${
              index === 0 ? 'border-brand-600' : 'border-[#e3d6f2]'
            }`}
          >
            <div className="text-[13px] font-extrabold tracking-[0.1em] text-brand-600">
              {step.number}
            </div>
            <div className="mt-2 text-[18px] font-bold tracking-[-0.01em] text-[#17131c]">
              {step.title}
            </div>
            <div className="mt-1.5 text-[14px] leading-[1.5] text-[#5f5868]">
              {step.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
