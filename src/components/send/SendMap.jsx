'use client'

import { useEffect, useRef, useState } from 'react'

import { importMapsLibrary } from '@/lib/maps-loader'

// Two-pin map for step 1, with the driving route drawn between them.
//
// The route comes from the Maps JS DirectionsService ('routes' library), loaded
// through the shared loader with the same browser key as every other Maps
// surface. The Directions API must be enabled on that key — if it is not, the
// request fails and the map falls back to the two pins with no line.
//
// BILLING: Directions is charged PER REQUEST. A re-render must never trigger a
// new call. lastRouteKeyRef holds the coordinate pair that was last requested
// and is set BEFORE the await, so React StrictMode's double-invoked effects and
// any concurrent render collapse into a single request.
//
// DISTANCE AND DURATION ARE DELIBERATELY NOT SHOWN. The route object carries
// both, but the price the customer sees is computed by the backend from OSRM.
// The two engines disagree — sometimes by several hundred metres — and printing
// Google's distance beside a backend-derived price shows two different numbers
// for the same trip. The line is decoration and orientation, not a measurement.
//
// Same Map ID and loader as the live tracking maps.

const MAP_ID = 'ea0f34dfd1b56b44758f5576'
const SINGLE_PIN_ZOOM = 14
const FIT_PADDING = 64

export function SendMap({ pickup, dropoff }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const directionsRendererRef = useRef(null)
  const lastRouteKeyRef = useRef(null)
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
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            mapId: MAP_ID,
          })
        }

        const map = mapInstanceRef.current

        // Rebuild pins on every change — there are at most two.
        markersRef.current.forEach((marker) => {
          marker.map = null
        })
        markersRef.current = []

        // Pins are built in their own try/catch so that a marker failure
        // cannot take the route line down with it. PinElement construction can
        // throw independently of everything else — it does exactly that when
        // the API key rejects the referrer — and before this was isolated, that
        // exception aborted the rest of this function, so the Directions
        // request below was never even attempted.
        try {
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

          // Frame the pins immediately, so the map is useful before the route
          // request resolves. If a route arrives it re-fits to include the line.
          if (points.length > 1) {
            map.fitBounds(bounds, FIT_PADDING)
          } else {
            map.setCenter({ lat: points[0].lat, lng: points[0].lng })
            map.setZoom(SINGLE_PIN_ZOOM)
          }
        } catch (error) {
          // Map still renders; it just has no pins.
        }

        if (!cancelled) {
          setStatus('ready')
        }

        // ── Route ────────────────────────────────────────────────────────────

        // Only ever request with BOTH endpoints. A one-ended request is
        // meaningless and still billable.
        if (points.length < 2) {
          // Dropped back to a single point — remove any existing line so it
          // cannot linger against the wrong pair.
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null)
            directionsRendererRef.current = null
          }
          lastRouteKeyRef.current = null
          return
        }

        const routeKey = `${pickup.lat},${pickup.lng}>${dropoff.lat},${dropoff.lng}`

        // Same pair as the last request — the line on screen is already
        // correct. Skipping here is what keeps re-renders free.
        if (lastRouteKeyRef.current === routeKey) {
          return
        }

        // Claimed BEFORE awaiting, so a second invocation in the same tick
        // (StrictMode) sees it and does not fire a duplicate billable request.
        //
        // Deliberately not cleared on failure: a route that errors for this
        // pair would otherwise be retried on every re-render. The customer
        // keeps both pins and can continue regardless, and changing either
        // address produces a new key and a fresh attempt.
        lastRouteKeyRef.current = routeKey

        try {
          const { DirectionsService, DirectionsRenderer } =
            await importMapsLibrary('routes')

          if (cancelled || !mapInstanceRef.current) {
            return
          }

          const result = await new DirectionsService().route({
            origin: { lat: pickup.lat, lng: pickup.lng },
            destination: { lat: dropoff.lat, lng: dropoff.lng },
            travelMode: 'DRIVING',
          })

          if (cancelled || !mapInstanceRef.current) {
            return
          }

          const route = result?.routes?.[0]

          if (!route) {
            return
          }

          if (!directionsRendererRef.current) {
            directionsRendererRef.current = new DirectionsRenderer({
              // Our own A/B pins are already on the map; the renderer's
              // default markers would sit on top of them.
              suppressMarkers: true,
              // We control framing ourselves, below.
              preserveViewport: true,
              polylineOptions: {
                strokeColor: '#7B2FBE',
                strokeOpacity: 0.85,
                strokeWeight: 5,
              },
            })
          }

          directionsRendererRef.current.setMap(mapInstanceRef.current)
          directionsRendererRef.current.setDirections(result)

          // Frame the whole line plus both pins. The route's own bounds cover
          // the path, but the pins sit at the exact addresses while the route
          // snaps to the road, so union them rather than trusting either alone.
          const routeBounds = new LatLngBounds()

          if (route.bounds) {
            routeBounds.union(route.bounds)
          }

          points.forEach((point) => {
            routeBounds.extend({ lat: point.lat, lng: point.lng })
          })

          if (!routeBounds.isEmpty()) {
            mapInstanceRef.current.fitBounds(routeBounds, FIT_PADDING)
          }
        } catch (error) {
          // Denied key, Directions API not enabled, ZERO_RESULTS, network
          // failure — all identical from here. Both pins and the map stay
          // exactly as they were; nothing user-facing is shown and Continue is
          // unaffected. The line is an enhancement, not a requirement.
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

  // Detach the renderer when the component goes away, so it does not hold a
  // reference to a map that is being torn down.
  useEffect(() => {
    return () => {
      directionsRendererRef.current?.setMap(null)
      directionsRendererRef.current = null
    }
  }, [])

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
