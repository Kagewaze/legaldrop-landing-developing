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
    <section className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
      <h2 className="font-display text-3xl font-extrabold text-[#17131c]">
        How it works
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <div
            key={step.number}
            className={`border-t-[3px] pt-[18px] ${
              index === 0 ? 'border-[#17131c]' : 'border-[#e5e1e8]'
            }`}
          >
            <div className="text-sm font-semibold tracking-label text-[#8d8695]">
              {step.number}
            </div>
            <div className="mt-2 text-lg font-bold text-[#17131c]">
              {step.title}
            </div>
            <div className="mt-1.5 text-sm text-[#5f5868]">
              {step.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
