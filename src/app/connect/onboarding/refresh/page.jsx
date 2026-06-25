'use client'

import { ClockIcon } from '@heroicons/react/24/outline'

export default function ConnectOnboardingRefreshPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="flex justify-center">
          <ClockIcon aria-hidden="true" className="h-14 w-14 text-amber-500" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">
          Your setup link expired
        </h1>
        <p className="mt-4 text-sm text-slate-600">
          This payout setup link is no longer valid. Reopen &lsquo;Set up
          payouts&rsquo; in the LegalDrop app to finish setting up your payouts.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.href = 'legaldrop://connect/refresh'
          }}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          Open the LegalDrop app
        </button>
        <p className="mt-4 text-xs text-slate-500">
          If nothing happens, switch back to the LegalDrop app manually.
        </p>
      </div>
    </main>
  )
}
