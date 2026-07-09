'use client'

import { useEffect, useRef, useState } from 'react'

// Reuse the same Maps key already used on the partner platform.
// Hardcoded to match this repo's convention (see API_BASE_URL in page.jsx).
const GOOGLE_MAPS_API_KEY = 'AIzaSyA5Hf0alZULns0oB_VjhwOEQJog4LvYF1w'

// AdvancedMarkerElement requires a Map ID. 'DEMO_MAP_ID' works out of the
// box for development; swap in a production Map ID created in Cloud Console
// (Google Maps Platform > Map Management) before launch.
const MAP_ID = 'DEMO_MAP_ID'
const DEFAULT_ZOOM = 15

// Google's current recommended inline bootstrap loader (loading=async).
// Defines google.maps.importLibrary once; the actual JS is fetched lazily
// on the first importLibrary() call. Safe to call repeatedly.
function ensureMapsBootstrap() {
  if (typeof window === 'undefined') {
    return
  }

  if (window.google?.maps?.importLibrary) {
    return
  }

  ;((g) => {
    var h,
      a,
      k,
      p = 'The Google Maps JavaScript API',
      c = 'google',
      l = 'importLibrary',
      q = '__ib__',
      m = document,
      b = window
    b = b[c] || (b[c] = {})
    var d = b.maps || (b.maps = {}),
      r = new Set(),
      e = new URLSearchParams(),
      u = () =>
        h ||
        (h = new Promise(async (f, n) => {
          await (a = m.createElement('script'))
          e.set('libraries', [...r] + '')
          for (k in g) e.set(k.replace(/[A-Z]/g, (t) => '_' + t[0].toLowerCase()), g[k])
          e.set('callback', c + '.maps.' + q)
          a.src = `https://maps.${c}apis.com/maps/api/js?` + e
          d[q] = f
          a.onerror = () => (h = n(Error(p + ' could not load.')))
          a.nonce = m.querySelector('script[nonce]')?.nonce || ''
          m.head.append(a)
        }))
    d[l]
      ? console.warn(p + ' only loads once. Ignoring:', g)
      : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)))
  })({ key: GOOGLE_MAPS_API_KEY, v: 'weekly' })
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

    async function initMap() {
      try {
        ensureMapsBootstrap()

        const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
          window.google.maps.importLibrary('maps'),
          window.google.maps.importLibrary('marker'),
        ])

        if (cancelled || !mapRef.current) {
          return
        }

        const position = { lat: latitude, lng: longitude }

        const map = new Map(mapRef.current, {
          center: position,
          zoom: DEFAULT_ZOOM,
          mapId: MAP_ID,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        new AdvancedMarkerElement({ map, position })

        setStatus('ready')
      } catch (error) {
        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    initMap()

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
        <div
          ref={mapRef}
          className="h-full w-full"
          aria-label="Map showing the driver's current location"
        />
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
