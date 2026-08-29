'use client'

import { useEffect, useRef, useState } from 'react'

import { importMapsLibrary, subscribeMapsAuthFailure } from '@/lib/maps-loader'
import {
  computeMovementHeading,
  normalizeCoordinate,
} from '@/lib/tracking-map.mjs'
import {
  createDriverMarker,
  observeMapInteraction,
  setDriverMarkerHeading,
} from '@/lib/tracking-map-browser'
import { TrackingMapRecenter } from '@/components/track/TrackingMapRecenter'

// Production Cloud Console Map ID for the legal-drop project. Vector map —
// required by AdvancedMarkerElement.
const MAP_ID = 'ea0f34dfd1b56b44758f5576'
const DEFAULT_ZOOM = 15

export function TrackingMap({ driverLocation, isLive = true }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const markerVehicleRef = useRef(null)
  const previousDriverRef = useRef(null)
  const followingRef = useRef(true)
  const mapUnavailableRef = useRef(false)
  const [following, setFollowing] = useState(true)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  const driver = normalizeCoordinate(driverLocation)
  const hasValidCoords = driver != null

  function markMapUnavailable(error, context) {
    if (mapUnavailableRef.current) return

    mapUnavailableRef.current = true
    followingRef.current = false
    setFollowing(false)
    setStatus('error')
    console.error(
      `[consumer-tracking-map] Google Maps ${context}; map disabled.`,
      error,
    )
  }

  function runMapOperation(context, operation) {
    if (mapUnavailableRef.current) return false

    try {
      operation()
      return true
    } catch (error) {
      markMapUnavailable(error, context)
      return false
    }
  }

  function recenter() {
    if (!driver || !mapInstanceRef.current || mapUnavailableRef.current) return
    followingRef.current = true
    setFollowing(true)
    runMapOperation('recenter failed', () => {
      mapInstanceRef.current.setZoom(DEFAULT_ZOOM)
      mapInstanceRef.current.panTo(driver)
    })
  }

  useEffect(
    () =>
      subscribeMapsAuthFailure(() => {
        markMapUnavailable(
          new Error('Google Maps authentication failed.'),
          'authentication failed',
        )
      }),
    [],
  )

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

        let map
        let markerResult
        const initialized = runMapOperation('initialization failed', () => {
          map = new Map(mapRef.current, {
            center: driver,
            zoom: DEFAULT_ZOOM,
            mapId: MAP_ID,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          })
          markerResult = createDriverMarker({
            AdvancedMarkerElement,
            map,
            position: driver,
            heading: null,
          })
        })
        if (!initialized || cancelled) return

        const { marker, vehicle } = markerResult
        markerRef.current = marker
        markerVehicleRef.current = vehicle
        previousDriverRef.current = driver
        mapInstanceRef.current = map

        setStatus('ready')
      } catch (error) {
        if (!cancelled) {
          markMapUnavailable(error, 'initialization failed')
        }
      }
    }

    initMap()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidCoords])

  // Move the existing marker in place. Movement supplies a conservative
  // heading because the consumer payload has no heading field. Camera updates
  // happen only while follow mode remains enabled.
  useEffect(() => {
    if (
      !driver ||
      !mapInstanceRef.current ||
      !markerRef.current ||
      mapUnavailableRef.current
    ) {
      return
    }

    const heading = computeMovementHeading(previousDriverRef.current, driver)
    const updated = runMapOperation('driver update failed', () => {
      markerRef.current.position = driver
      setDriverMarkerHeading(markerVehicleRef.current, heading)

      if (followingRef.current) {
        mapInstanceRef.current.panTo(driver)
      }
    })

    if (updated) previousDriverRef.current = driver
    // The normalized `driver` object is recreated during render. Coordinates
    // are the intentional update contract; depending on the object would rerun
    // this Google mutation after unrelated state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver?.lat, driver?.lng])

  useEffect(() => {
    return () => {
      try {
        if (markerRef.current) markerRef.current.map = null
      } catch (error) {
        // An unauthorized Maps runtime can reject teardown mutations too. The
        // container is being removed, so clearing local references is enough.
      }
      markerRef.current = null
      markerVehicleRef.current = null
      previousDriverRef.current = null
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const element = mapRef.current
    if (!element) return undefined

    const disableFollow = () => {
      if (!followingRef.current) return
      followingRef.current = false
      setFollowing(false)
    }
    return observeMapInteraction(element, disableFollow)
  }, [])

  return (
    <section className="overflow-hidden rounded-card border border-[#d9c7e6] bg-surface-raised shadow-[0_2px_4px_rgba(82,28,130,0.06),0_18px_42px_-24px_rgba(82,28,130,0.38)]">
      <h2 className="sr-only">
        {isLive ? 'Live driver location' : "Driver's last known location"}
      </h2>
      <div className="relative h-[clamp(360px,50vh,560px)] w-full bg-[#f3eafa] lg:h-[clamp(520px,62vh,720px)]">
        <div
          ref={mapRef}
          className="h-full w-full"
          aria-label={
            isLive
              ? "Map showing the driver's current location"
              : "Map showing the driver's last known location"
          }
        />
        {status !== 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#f4eafb_58%,#eee0f8_100%)] px-6 text-center text-[#5f5868]">
            {status === 'error' ? (
              <>
                <span
                  aria-hidden="true"
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-700 shadow-card ring-1 ring-[#ddcbea]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 18 9 6l6 12 5-9" />
                    <circle cx="4" cy="18" r="1.5" fill="currentColor" />
                    <circle cx="20" cy="9" r="1.5" fill="currentColor" />
                  </svg>
                </span>
                <p className="font-display text-lg font-extrabold text-[#281632]">
                  Map temporarily unavailable
                </p>
                <p className="mt-2 text-[13px]">
                  Delivery status and tracking updates are still available.
                </p>
              </>
            ) : (
              <p className="text-[13px]">Loading map…</p>
            )}
          </div>
        )}
        {status === 'ready' && !following ? (
          <TrackingMapRecenter
            onClick={recenter}
            label={
              isLive
                ? 'Recenter map on driver'
                : 'Recenter map on last known driver position'
            }
          />
        ) : null}
      </div>
    </section>
  )
}
