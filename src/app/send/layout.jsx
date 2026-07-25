import { BRAND } from '@/lib/config'
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

export const metadata = {
  title: `Send a package | ${BRAND.name}`,
}

export default function SendLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f4f8]">
      <Header />

      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-8 sm:py-10">
        <SendFlowProvider>
          <StepChrome />

          <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_14px_40px_rgba(23,19,28,0.08)]">
            {children}
          </div>
        </SendFlowProvider>
      </div>
    </div>
  )
}
