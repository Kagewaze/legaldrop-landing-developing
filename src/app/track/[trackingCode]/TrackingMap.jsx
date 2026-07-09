'use client'

import { useEffect, useRef, useState } from 'react'

// Reuse the same Maps key already used on the partner platform.
// Hardcoded to match this repo's convention (see API_BASE_URL in page.jsx).
const GOOGLE_MAPS_API_KEY = 'AIzaSyABT9-R_ydog2V1vIx17pfLpCHHaIHCASQ'
const SCRIPT_ID = 'google-maps-js-api'
const DEFAULT_ZOOM = 15

function loadGoogleMaps() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only load in the browser.'))
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps)
  }

  return new Promise((resolve, reject) => {
    const handleLoad = () => {
      if (window.google?.maps) {
        resolve(window.google.maps)
      } else {
        reject(new Error('Google Maps failed to initialise.'))
      }
    }

    const existing = document.getElementById(SCRIPT_ID)

    if (existing) {
      existing.addEventListener('load', handleLoad, { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google Maps.')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`
    script.async = true
    script.defer = true
    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('Failed to load Google Maps.')),
      { once: true },
    )
    document.head.appendChild(script)
  })
}

export function TrackingMap({ driverLocation }) {
  const mapRef = useRef(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  const latitude = Number(driverLocation?.latitude)
  const longitude = Number(driverLocation?.longitude)

  useEffect(() => {
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setStatus('error')
      return undefined
    }

    let cancelled = false
    setStatus('loading')

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapRef.current) {
          return
        }

        const position = { lat: latitude, lng: longitude }

        const map = new maps.Map(mapRef.current, {
          center: position,
          zoom: DEFAULT_ZOOM,
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        new maps.Marker({ position, map })

        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [latitude, longitude])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        Driver Location
      </p>
      <div className="relative mt-4 h-64 w-full overflow-hidden rounded-2xl bg-slate-100">
        <div ref={mapRef} className="h-full w-full" aria-label="Map showing the driver's current location" />
        {status !== 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-slate-400">
            {status === 'error'
              ? 'We couldn’t load the map right now.'
              : 'Loading map…'}
          </div>
        )}
      </div>
    </section>
  )
}
