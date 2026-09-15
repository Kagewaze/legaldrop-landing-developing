'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'

import { customerTrackingPath } from '@/lib/home-tracking.mjs'

export function HomeTrackingBar() {
  const router = useRouter()
  const inputId = useId()
  const errorId = `${inputId}-error`
  const [trackingCode, setTrackingCode] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const destination = customerTrackingPath(trackingCode)
    if (!destination) {
      setError('Enter a tracking code to continue.')
      return
    }

    setError('')
    router.push(destination)
  }

  return (
    <section aria-labelledby={`${inputId}-title`} className="px-5 sm:px-8">
      <div className="mx-auto max-w-[1200px] rounded-[20px] border border-[#dfd0e9] bg-white p-5 shadow-card sm:p-6">
        <form
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <div data-motion-copy className="lg:w-[280px] lg:flex-none lg:self-center">
            <h2
              id={`${inputId}-title`}
              className="font-display text-xl font-extrabold text-[#281632] sm:text-2xl"
            >
              Track Your Package
            </h2>
            <p className="mt-1 text-sm text-[#62566a]">
              Enter the tracking code from your Druppr confirmation.
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <label
              htmlFor={inputId}
              className="block text-sm font-semibold text-[#3c2d45]"
            >
              Tracking code
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id={inputId}
                name="trackingCode"
                type="text"
                value={trackingCode}
                onChange={(event) => {
                  setTrackingCode(event.target.value)
                  if (error) setError('')
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="Enter tracking code"
                className="min-h-11 min-w-0 flex-1 rounded-control border border-[#cfc1d8] bg-white px-4 py-3 text-base uppercase text-[#281632] outline-none transition placeholder:normal-case placeholder:text-[#817587] focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-control bg-brand-600 px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:flex-none"
              >
                Track
              </button>
            </div>
            {error ? (
              <p id={errorId} role="alert" className="mt-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  )
}
