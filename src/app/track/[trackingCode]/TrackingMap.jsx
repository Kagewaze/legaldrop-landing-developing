'use client'

import { useEffect, useRef, useState } from 'react'

import { importMapsLibrary } from '@/lib/maps-loader'

// Production Cloud Console Map ID for the legal-drop project. Vector map —
// required by AdvancedMarkerElement.
const MAP_ID = 'ea0f34dfd1b56b44758f5576'
const DEFAULT_ZOOM = 15

export function TrackingMap({ driverLocation }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  const latitude = Number(driverLocation?.latitude)
  const longitude = Number(driverLocation?.longitude)
  const hasValidCoords = !Number.isNaN(latitude) && !Number.isNaN(longitude)

  // Initialise the map + marker exactly once. The bootstrap loader / Map ID
  // logic is reused untouched; later coordinate changes only pan the map.
  useEffect(() => {
    if (!hasValidCoords) {
      setStatus('error')
      return undefined
    }

    if (mapInstanceRef.current) {
      return undefined
    }

    let cancelled = false

    async function initMap() {
      try {
        const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
          importMapsLibrary('maps'),
          importMapsLibrary('marker'),
        ])

        if (cancelled || !mapRef.current || mapInstanceRef.current) {
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

        markerRef.current = new AdvancedMarkerElement({ map, position })
        mapInstanceRef.current = map

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidCoords])

  // Smoothly pan the existing map to the driver's new position on each
  // update, rather than tearing down and rebuilding the map instance.
  useEffect(() => {
    if (!hasValidCoords || !mapInstanceRef.current || !markerRef.current) {
      return
    }

    const position = { lat: latitude, lng: longitude }
    mapInstanceRef.current.panTo(position)
    markerRef.current.position = position
  }, [latitude, longitude, hasValidCoords])

  return (
    <section className="rounded-card border border-[#eeebf1] bg-surface-raised p-6 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
        Driver Location
      </p>
      <div className="relative mt-4 h-64 w-full overflow-hidden rounded-[14px] bg-surface-tint">
        <div
          ref={mapRef}
          className="h-full w-full"
          aria-label="Map showing the driver's current location"
        />
        {status !== 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[13px] text-[#5f5868]">
            {status === 'error'
              ? 'We couldn’t load the map right now.'
              : 'Loading map…'}
          </div>
        )}
      </div>
    </section>
  )
}
