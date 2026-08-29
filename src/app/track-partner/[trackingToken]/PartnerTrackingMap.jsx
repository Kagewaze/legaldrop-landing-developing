'use client'

import { useEffect, useRef, useState } from 'react'

import { importMapsLibrary } from '@/lib/maps-loader'
import {
  collectBoundsCoordinates,
  normalizeCoordinate,
  resolveDriverHeading,
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
const DEFAULT_ZOOM = 14

export function PartnerTrackingMap({
  driverLocation,
  senderLocation,
  receivers,
  route,
  isLive = true,
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const advancedMarkerCtorRef = useRef(null)
  const carMarkerRef = useRef(null)
  const carInnerRef = useRef(null)
  const prevDriverRef = useRef(null)
  const staticMarkersRef = useRef([])
  const routePolylineRef = useRef(null)
  const followingRef = useRef(true)
  const [following, setFollowing] = useState(true)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  const driver = normalizeCoordinate(driverLocation)
  const hasValidDriver = driver != null

  function recenter() {
    if (!driver || !mapInstanceRef.current) return
    followingRef.current = true
    setFollowing(true)
    mapInstanceRef.current.setZoom(DEFAULT_ZOOM)
    mapInstanceRef.current.panTo(driver)
  }

  // Initialise the map, route line and pickup/destination pins exactly once,
  // from whatever geography is available — pickup, destinations and route
  // are known up front regardless of whether a driver has been assigned yet.
  // The car marker is added here too if a driver is already present, but
  // its absence must never block the rest of the map from rendering: a
  // pending order (no driver) still has pickup/destination/route to show.
  useEffect(() => {
    if (mapInstanceRef.current) {
      return undefined
    }

    let cancelled = false

    async function initMap() {
      try {
        const [{ Map }, { AdvancedMarkerElement, PinElement }, { LatLngBounds }] =
          await Promise.all([
            importMapsLibrary('maps'),
            importMapsLibrary('marker'),
            importMapsLibrary('core'),
          ])

        if (cancelled || !mapRef.current || mapInstanceRef.current) {
          return
        }

        advancedMarkerCtorRef.current = AdvancedMarkerElement

        // Route polyline. NOTE: route.coordinates is intentionally only the
        // sender → first-stop leg (matches the backend's current
        // sender-to-first-stop-only scope from step 4a). The destination pins
        // below are drawn for EVERY receiver, so with multiple stops the line
        // will reach only the first pin. This asymmetry is deliberate, not a
        // bug — it tracks the backend's deferred multi-waypoint route scope.
        const routePath = (Array.isArray(route?.coordinates)
          ? route.coordinates
          : []
        )
          .map(normalizeCoordinate)
          .filter(Boolean)

        const sender = normalizeCoordinate(senderLocation)
        const receiverList = Array.isArray(receivers) ? receivers : []
        const receiverPositions = receiverList.map((receiver) =>
          normalizeCoordinate(receiver?.receiverLocation ?? receiver),
        )

        // Nothing at all to plot yet (no sender, no driver, no receivers, no
        // route) — genuinely nothing to render, unlike the old "no driver"
        // gate which blocked rendering even when pickup/destination existed.
        if (
          !sender &&
          !driver &&
          routePath.length === 0 &&
          !receiverPositions.some(Boolean)
        ) {
          setStatus('error')
          return
        }

        const initialCenter =
          sender ?? driver ?? receiverPositions.find(Boolean) ?? routePath[0]

        const map = new Map(mapRef.current, {
          center: initialCenter,
          zoom: DEFAULT_ZOOM,
          mapId: MAP_ID,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        const bounds = new LatLngBounds()
        const boundsPoints = collectBoundsCoordinates({
          driver,
          pickup: sender,
          destinations: receiverPositions,
          route: routePath,
        })
        boundsPoints.forEach((point) => bounds.extend(point))

        if (routePath.length >= 2) {
          const polyline = new window.google.maps.Polyline({
            path: routePath,
            geodesic: true,
            strokeColor: '#7c3aed',
            strokeOpacity: 0.9,
            strokeWeight: 4,
          })
          polyline.setMap(map)
          routePolylineRef.current = polyline
        }

        // Pickup pin (sender).
        if (sender) {
          const pickupPin = new PinElement({
            background: '#10b981',
            borderColor: '#047857',
            glyphColor: '#ffffff',
            glyph: 'A',
          })
          staticMarkersRef.current.push(
            new AdvancedMarkerElement({
              map,
              position: sender,
              content: pickupPin.element,
              title: 'Pickup',
            }),
          )
        }

        // Destination pin for every receiver, numbered in order.
        receiverList.forEach((receiver, index) => {
          const position = receiverPositions[index]
          if (!position) {
            return
          }

          const pin = new PinElement({
            background: '#7c3aed',
            borderColor: '#5b21b6',
            glyphColor: '#ffffff',
            glyph: String(index + 1),
          })
          staticMarkersRef.current.push(
            new AdvancedMarkerElement({
              map,
              position,
              content: pin.element,
              title: receiver?.receiverName || `Stop ${index + 1}`,
            }),
          )
        })

        // Car marker for the live driver position, if already assigned. If
        // the driver is assigned later, the update effect below creates it.
        if (driver) {
          const { marker, vehicle } = createDriverMarker({
            AdvancedMarkerElement,
            map,
            position: driver,
            heading: resolveDriverHeading({
              backendHeading: driverLocation?.heading,
              previous: null,
              current: driver,
            }),
          })
          carMarkerRef.current = marker
          carInnerRef.current = vehicle
          prevDriverRef.current = driver
        }

        mapInstanceRef.current = map

        // Frame everything on first paint; a single-point bounds makes
        // fitBounds over-zoom, so fall back to a sensible default instead.
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, 64)
          if (boundsPoints.length <= 1) {
            map.setZoom(DEFAULT_ZOOM)
          }
        }

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
  }, [])

  // Move + rotate the car on each driver update, panning to keep it in view.
  // Prefer a backend heading; otherwise derive it from the movement delta.
  // Also handles the driver appearing for the first time after initial map
  // load (order went from pending → ongoing mid-poll): the car marker is
  // created here rather than at init in that case.
  useEffect(() => {
    if (!hasValidDriver || status !== 'ready' || !mapInstanceRef.current) {
      return
    }

    if (!carMarkerRef.current) {
      if (!advancedMarkerCtorRef.current) {
        return
      }

      const { marker, vehicle } = createDriverMarker({
        AdvancedMarkerElement: advancedMarkerCtorRef.current,
        map: mapInstanceRef.current,
        position: driver,
        heading: resolveDriverHeading({
          backendHeading: driverLocation?.heading,
          previous: null,
          current: driver,
        }),
      })
      carMarkerRef.current = marker
      carInnerRef.current = vehicle
      prevDriverRef.current = driver
      if (followingRef.current) mapInstanceRef.current.panTo(driver)
      return
    }

    carMarkerRef.current.position = driver
    const previous = prevDriverRef.current
    const moved =
      previous && (previous.lat !== driver.lat || previous.lng !== driver.lng)
    const heading = resolveDriverHeading({
      backendHeading: driverLocation?.heading,
      previous,
      current: driver,
    })
    setDriverMarkerHeading(carInnerRef.current, heading)

    if (moved && followingRef.current) {
      mapInstanceRef.current.panTo(driver)
    }

    prevDriverRef.current = driver
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver?.lat, driver?.lng, driverLocation?.heading, hasValidDriver, status])

  useEffect(() => {
    return () => {
      staticMarkersRef.current.forEach((marker) => {
        marker.map = null
      })
      staticMarkersRef.current = []
      if (carMarkerRef.current) carMarkerRef.current.map = null
      routePolylineRef.current?.setMap(null)
      routePolylineRef.current = null
      carMarkerRef.current = null
      carInnerRef.current = null
      prevDriverRef.current = null
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
        {isLive ? 'Live delivery route' : 'Delivery route and final positions'}
      </h2>
      <div className="relative h-[clamp(360px,46vh,560px)] w-full bg-surface-tint">
        <div
          ref={mapRef}
          className="h-full w-full"
          aria-label={
            isLive
              ? "Map showing the driver's live position, pickup, and delivery stops"
              : "Map showing the driver's last known position, pickup, and delivery stops"
          }
        />
        {status !== 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[13px] text-[#5f5868]">
            {status === 'error'
              ? 'We couldn’t load the map right now.'
              : 'Loading map…'}
          </div>
        )}
        {status === 'ready' && !following && driver ? (
          <TrackingMapRecenter onClick={recenter} />
        ) : null}
      </div>
    </section>
  )
}
