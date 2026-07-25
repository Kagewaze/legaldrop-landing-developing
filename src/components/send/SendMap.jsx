'use client'

import { useEffect, useRef, useState } from 'react'

import { importMapsLibrary } from '@/lib/maps-loader'

// Two-pin map for step 1: pickup and dropoff.
//
// NO ROUTE POLYLINE. The design draws a line between the pins, but a real route
// needs the Directions/Routes API — a separate billed product with its own key
// scope. Drawing a straight line instead would misrepresent the journey (and
// therefore the distance the customer is being quoted on), so there is no line
// at all.
//
// Same Map ID and loader as the live tracking maps.

const MAP_ID = 'ea0f34dfd1b56b44758f5576'
const SINGLE_PIN_ZOOM = 14

export function SendMap({ pickup, dropoff }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  const points = [
    pickup ? { ...pickup, kind: 'pickup' } : null,
    dropoff ? { ...dropoff, kind: 'dropoff' } : null,
  ].filter(Boolean)

  const signature = points.map((p) => `${p.kind}:${p.lat},${p.lng}`).join('|')

  useEffect(() => {
    if (points.length === 0) {
      return undefined
    }

    let cancelled = false

    async function render() {
      try {
        const [{ Map }, { AdvancedMarkerElement, PinElement }, { LatLngBounds }] =
          await Promise.all([
            importMapsLibrary('maps'),
            importMapsLibrary('marker'),
            importMapsLibrary('core'),
          ])

        if (cancelled || !mapRef.current) {
          return
        }

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new Map(mapRef.current, {
            center: { lat: points[0].lat, lng: points[0].lng },
            zoom: SINGLE_PIN_ZOOM,
            mapId: MAP_ID,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          })
        }

        const map = mapInstanceRef.current

        // Rebuild pins on every change — there are at most two.
        markersRef.current.forEach((marker) => {
          marker.map = null
        })
        markersRef.current = []

        const bounds = new LatLngBounds()

        points.forEach((point) => {
          const isPickup = point.kind === 'pickup'
          const pin = new PinElement({
            background: isPickup ? '#7B2FBE' : '#17131c',
            borderColor: isPickup ? '#5d1f96' : '#000000',
            glyphColor: '#ffffff',
            glyph: isPickup ? 'A' : 'B',
          })

          const position = { lat: point.lat, lng: point.lng }

          markersRef.current.push(
            new AdvancedMarkerElement({
              map,
              position,
              content: pin.element,
              title: isPickup ? 'Pickup' : 'Dropoff',
            }),
          )

          bounds.extend(position)
        })

        if (points.length > 1) {
          map.fitBounds(bounds, 72)
        } else {
          map.setCenter({ lat: points[0].lat, lng: points[0].lng })
          map.setZoom(SINGLE_PIN_ZOOM)
        }

        if (!cancelled) {
          setStatus('ready')
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    render()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  if (points.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center bg-[#eceee8] px-8 text-center">
        <p className="max-w-[260px] text-[14px] text-[#5f5868]">
          Enter a pickup and dropoff address to see them on the map.
        </p>
      </div>
    )
  }

  return (
    <div className="relative min-h-[420px] bg-[#eceee8]">
      <div ref={mapRef} className="absolute inset-0 h-full w-full" />
      {status !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[14px] text-[#5f5868]">
          {status === 'error'
            ? 'We couldn’t load the map right now.'
            : 'Loading map…'}
        </div>
      )}
    </div>
  )
}
