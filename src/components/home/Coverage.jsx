import { SERVICE_AREA } from '@/lib/navigation'

// Service-area band.
//
// SERVICE_AREA is shared with the footer's bottom bar so the two can never
// disagree about where the business operates.

const CITIES =
  'Downtown, North York, Scarborough, Etobicoke, Mississauga, Vaughan, Markham, Brampton.'

export function Coverage() {
  return (
    <section className="mt-16 border-y border-[#f0eaf6] bg-[#faf7fd]">
      {/* The design puts a "Check your address →" link on the right. Omitted:
          it has no destination, and there is no address-checking page to send
          anyone to. The band still carries the information on its own. */}
      <div className="mx-auto flex max-w-[1200px] items-center gap-3.5 px-8 py-9">
        <span className="h-3 w-3 flex-none rounded-full bg-brand-600" />
        <div>
          <div className="text-[20px] font-extrabold tracking-[-0.02em] text-[#17131c]">
            {SERVICE_AREA}
          </div>
          <div className="mt-0.5 text-[14px] text-[#5f5868]">{CITIES}</div>
        </div>
      </div>
    </section>
  )
}
