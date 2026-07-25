'use client'

import { usePathname } from 'next/navigation'

// "STEP n OF 3" header. Step 3 (payment) does not exist yet, but the flow is
// three steps and telling someone they are on step 2 of 2 would be a lie about
// how much is left.
const TOTAL_STEPS = 3

const STEPS = [
  { path: '/send/details', index: 2, label: 'Choose vehicle' },
  { path: '/send', index: 1, label: 'Addresses' },
]

export function StepChrome() {
  const pathname = usePathname()
  const step = STEPS.find((entry) => pathname.startsWith(entry.path))

  if (!step) {
    return null
  }

  return (
    <div className="mb-3.5 flex flex-wrap items-baseline gap-3.5">
      <div className="text-[13px] font-extrabold tracking-[0.12em] text-brand-600">
        STEP {step.index} OF {TOTAL_STEPS}
      </div>
      <div className="text-[15px] text-[#5f5868]">{step.label}</div>
    </div>
  )
}
