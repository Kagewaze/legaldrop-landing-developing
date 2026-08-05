import { SendFlowProvider } from '@/lib/send-flow'
import { Header } from '@/components/Header'
import { StepChrome } from '@/components/send/StepChrome'

// Shared chrome for the send flow.
//
// The design imports the site nav INSIDE each step card — an artifact of how
// the design file was exported. Here the nav sits at the top of the page where
// it belongs, so the logo remains a way out of the flow.
//
// SendFlowProvider wraps every step, so state survives navigation between them
// (and, via sessionStorage, a refresh).

// Segment title only — no brand. The root layout's title.template appends it,
// so composing it here too would render 'Send a package - Druppr - Druppr'.
export const metadata = {
  title: 'Send a package',
}

// ⚠️ PHASE 9 ADDED THE SKIP LINK AND THE <main> LANDMARK.
//
// Every (main) route gets both from components/Layout.jsx. The send flow does
// not use that Layout — it has its own chrome and deliberately no Footer — so
// it had neither: measured across all eight public routes, /send, /send/details
// and /send/pay were the only ones with zero <main> landmarks and no way to
// bypass the header. WCAG 2.4.1 (Bypass Blocks) and 1.3.1 (Info and
// Relationships).
//
// That matters more here than on a content page: /send is where the homepage
// hero hands a visitor off, so a keyboard user who starts a booking on the
// homepage lands on the one route that makes them tab the whole nav again.
//
// The recipe is copied deliberately from Layout.jsx rather than shared: that
// component also renders Header AND Footer, and this flow must not gain a
// footer. If the skip-link styling changes there, change it here too.
const SKIP_LINK =
  'sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 ' +
  'focus:rounded-control focus:bg-brand-600 focus:px-5 focus:py-3 focus:text-base ' +
  'focus:font-semibold focus:text-white focus:outline-none focus:ring-2 ' +
  'focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600'

export default function SendLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f4f8]">
      <a href="#main-content" className={SKIP_LINK}>
        Skip to main content
      </a>
      <Header />

      {/* tabIndex={-1} so the skip link moves FOCUS here, not just scroll
          position — same reason as Layout.jsx. */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1200px] px-4 py-8 focus:outline-none sm:px-8 sm:py-10"
      >
        <SendFlowProvider>
          <StepChrome />

          <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_14px_40px_rgba(23,19,28,0.08)]">
            {children}
          </div>
        </SendFlowProvider>
      </main>
    </div>
  )
}
