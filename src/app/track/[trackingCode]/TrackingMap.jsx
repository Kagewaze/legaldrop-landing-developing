'use client'

import { useEffect, useRef, useState } from 'react'

import { importMapsLibrary } from '@/lib/maps-loader'
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
  const [following, setFollowing] = useState(true)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  const driver = normalizeCoordinate(driverLocation)
  const hasValidCoords = driver != null

  function recenter() {
    if (!driver || !mapInstanceRef.current) return
    followingRef.current = true
    setFollowing(true)
    mapInstanceRef.current.setZoom(DEFAULT_ZOOM)
    mapInstanceRef.current.panTo(driver)
  }

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

        const map = new Map(mapRef.current, {
          center: driver,
          zoom: DEFAULT_ZOOM,
          mapId: MAP_ID,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        const { marker, vehicle } = createDriverMarker({
          AdvancedMarkerElement,
          map,
          position: driver,
          heading: null,
        })
        markerRef.current = marker
        markerVehicleRef.current = vehicle
        previousDriverRef.current = driver
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

  // Move the existing marker in place. Movement supplies a conservative
  // heading because the consumer payload has no heading field. Camera updates
  // happen only while follow mode remains enabled.
  useEffect(() => {
    if (!driver || !mapInstanceRef.current || !markerRef.current) {
      return
    }

    const heading = computeMovementHeading(previousDriverRef.current, driver)
    markerRef.current.position = driver
    setDriverMarkerHeading(markerVehicleRef.current, heading)

    if (followingRef.current) {
      mapInstanceRef.current.panTo(driver)
    }

    previousDriverRef.current = driver
  }, [driver?.lat, driver?.lng])

  useEffect(() => {
    return () => {
      if (markerRef.current) markerRef.current.map = null
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
    <section className="overflow-hidden rounded-card border border-[#e5dfea] bg-surface-raised shadow-lift">
      <h2 className="sr-only">
        {isLive ? 'Live driver location' : "Driver's last known location"}
      </h2>
      <div className="relative h-[clamp(360px,46vh,560px)] w-full bg-surface-tint">
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
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[13px] text-[#5f5868]">
            {status === 'error'
              ? 'We couldn’t load the map right now.'
              : 'Loading map…'}
          </div>
        )}
        {status === 'ready' && !following ? (
          <TrackingMapRecenter onClick={recenter} />
        ) : null}
      </div>
    </section>
  )
}
