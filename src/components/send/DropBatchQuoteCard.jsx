import { formatMoney } from '@/components/send/PriceBreakdown'

// A real DropBatch price for a real matching trip — shown for comparison only.
//
// ⚠️ INFORMATIONAL BY CONSTRUCTION, NOT A DISABLED CONTROL.
// There is no verified App Store, Play Store, download or deep-link destination
// anywhere in this repository, and the public quote deliberately carries no trip id,
// so the web cannot address — let alone book — the specific trip this price belongs
// to. A button would therefore be a dead control, and a greyed-out one would imply
// the flow exists and is merely unavailable.
//
// So this renders as a <section>, not a <button>: no onClick, no role="button", no
// tabIndex, no aria-disabled. Nothing here is focusable, because nothing here does
// anything. Add a CTA only when a verified destination exists.
//
// ⚠️ DROPBATCH IS A DELIVERY MODE, NOT A VEHICLE. It is deliberately outside
// VehiclePicker: putting it among sedan/SUV/minivan would make it selectable-looking
// and imply it can be checked out like the others. Standard vehicle selection and
// checkout are completely unaffected by this card's presence.
//
// ⚠️ CLAIMS ARE BOUNDED. senderPays is the only figure shown — never driverEarns,
// platformFee or any breakdown component. It is never called cheapest, discounted or
// best value, and no saving is computed, even when it happens to be lower than the
// standard fare. The price is stated; the customer compares.
export function DropBatchQuoteCard({ senderPays, matchCount, soonestWindow, allOverCapacity }) {
  return (
    <section
      aria-labelledby="dropbatch-quote-heading"
      className="mt-8 rounded-2xl border-[1.5px] border-[#e3dfe8] bg-white p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id="dropbatch-quote-heading"
          className="text-[13px] font-extrabold tracking-[0.08em] text-[#8d8695]"
        >
          DROPBATCH
        </h2>
        {/* Price and label sit together so the figure is never read without the mode
            it belongs to. */}
        <div className="text-[22px] font-extrabold tracking-[-0.01em] text-[#17131c]">
          {formatMoney(senderPays)}
        </div>
      </div>

      <p className="mt-2 max-w-[52ch] text-[15px] text-[#5f5868]">
        Send with a trip already heading that way, at the pickup time you chose.
      </p>

      {soonestWindow?.date && (
        <p className="mt-3 text-[13px] text-[#5f5868]">
          {/* The trip's own departure window — the same public board data, carrying
              no identity. It is a DATE plus two times-of-day, not an instant, so it
              is rendered as-is rather than pushed through a timezone conversion that
              would imply precision the field does not have. Seconds are trimmed:
              a departure window is never specified to the second. */}
          <span className="font-semibold text-[#17131c]">Trip departs</span>{' '}
          {soonestWindow.date}
          {soonestWindow.start && soonestWindow.end && (
            <>
              {', '}
              {String(soonestWindow.start).slice(0, 5)}–{String(soonestWindow.end).slice(0, 5)}
            </>
          )}
          {matchCount > 1 && ` · ${matchCount} compatible trips`}
        </p>
      )}

      {/* overCapacity is passed through from the backend exactly as received. The
          match is NOT hidden — the sender may still ask the trip owner — but it must
          not read as guaranteed space. Only stated when EVERY match is flagged,
          because otherwise at least one has room. */}
      {allOverCapacity && (
        <p className="mt-3 text-[13px] text-[#5f5868]">
          This request is larger than the space currently left on{' '}
          {matchCount > 1 ? 'these trips' : 'this trip'}. The trip owner decides
          whether it still fits.
        </p>
      )}

      {/* The continuation, as plain text. Same wording as /drop-batch. */}
      <p className="mt-4 border-t border-[#f0eef2] pt-3 text-[13px] text-[#5f5868]">
        Posting and booking happen in the Druppr app.
      </p>
    </section>
  )
}
