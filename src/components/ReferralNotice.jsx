'use client'
import { useEffect, useState } from 'react'
export function ReferralNotice() {
  const [unavailable, setUnavailable] = useState(false)
  useEffect(
    () =>
      setUnavailable(new URLSearchParams(window.location.search).get('referral') === 'unavailable'),
    []
  )
  return unavailable ? (
    <p role="status" className="mt-3 text-sm text-[#5f5868]">
      This referral link is unavailable. You can continue booking normally.
    </p>
  ) : null
}
