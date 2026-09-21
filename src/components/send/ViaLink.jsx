'use client'

import { useEffect, useState } from 'react'
import { MarketingLink } from '@/components/MarketingNavigation'
import { bookingHrefWithVia } from '@/lib/via-navigation.mjs'

export function ViaLink({ href, ...props }) {
  const [search, setSearch] = useState('')
  useEffect(() => setSearch(window.location.search), [])
  return <MarketingLink href={bookingHrefWithVia(href, search)} {...props} />
}
