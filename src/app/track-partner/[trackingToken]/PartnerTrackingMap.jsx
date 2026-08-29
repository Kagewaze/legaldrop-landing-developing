'use client'

import { useEffect, useRef, useState } from 'react'

import { importMapsLibrary } from '@/lib/maps-loader'
import {
  collectBoundsCoordinates,
  getPartnerGeography,
  getPartnerGeographySignature,
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
  const pinCtorRef = useRef(null)
  const boundsCtorRef = useRef(null)
  const carMarkerRef = useRef(null)
  const carInnerRef = useRef(null)
  const prevDriverRef = useRef(null)
  const staticMarkersRef = useRef([])
  const routePolylineRef = useRef(null)
  const appliedGeographySignatureRef = useRef(null)
  const initialViewportSetRef = useRef(false)
  const followingRef = useRef(true)
  const [following, setFollowing] = useState(true)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  const driver = normalizeCoordinate(driverLocation)
  const hasValidDriver = driver != null
  const geography = getPartnerGeography({
    senderLocation,
    receivers,
    route,
  })
  const geographySignature = getPartnerGeographySignature(geography)
  const hasStaticGeography =
    geography.pickup != null ||
    geography.destinations.length > 0 ||
    geography.route.length > 0
  const hasMapContent = hasValidDriver || hasStaticGeography

  function recenter() {
    if (!driver || !mapInstanceRef.current) return
    followingRef.current = true
    setFollowing(true)
    mapInstanceRef.current.setZoom(DEFAULT_ZOOM)
    mapInstanceRef.current.panTo(driver)
  }

  // Initialise the Map and driver independently from the static delivery
  // layers. The reconciliation effect below owns pickup, stops and route.
  useEffect(() => {
    if (mapInstanceRef.current) {
      return undefined
    }

    if (!hasMapContent) {
      setStatus('error')
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
        pinCtorRef.current = PinElement
        boundsCtorRef.current = LatLngBounds
        const initialCenter =
          geography.pickup ??
          driver ??
          geography.destinations[0]?.position ??
          geography.route[0]

        const map = new Map(mapRef.current, {
          center: initialCenter,
          zoom: DEFAULT_ZOOM,
          mapId: MAP_ID,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
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
    // `hasMapContent` changes only when the page transitions from having
    // nothing plottable to having at least one valid point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMapContent])

  // Reconcile only the authorized static geography. A stable normalized
  // signature makes equivalent polling payloads a no-op even when every raw
  // object is freshly allocated. The Map and driver marker are never replaced.
  useEffect(() => {
    const map = mapInstanceRef.current
    const AdvancedMarkerElement = advancedMarkerCtorRef.current
    const PinElement = pinCtorRef.current
    const LatLngBounds = boundsCtorRef.current

    if (
      status !== 'ready' ||
      !map ||
      !AdvancedMarkerElement ||
      !PinElement ||
      !LatLngBounds ||
      appliedGeographySignatureRef.current === geographySignature
    ) {
      return
    }

    staticMarkersRef.current.forEach((marker) => {
      marker.map = null
    })
    staticMarkersRef.current = []
    routePolylineRef.current?.setMap(null)
    routePolylineRef.current = null

    try {
      if (geography.pickup) {
        const pickupPin = new PinElement({
          background: '#10b981',
          borderColor: '#047857',
          glyphColor: '#ffffff',
          glyph: 'A',
        })
        staticMarkersRef.current.push(
          new AdvancedMarkerElement({
            map,
            position: geography.pickup,
            content: pickupPin.element,
            title: 'Pickup',
          }),
        )
      }

      geography.destinations.forEach(({ position, stopNumber, title }) => {
        const pin = new PinElement({
          background: '#7c3aed',
          borderColor: '#5b21b6',
          glyphColor: '#ffffff',
          glyph: String(stopNumber),
        })
        staticMarkersRef.current.push(
          new AdvancedMarkerElement({
            map,
            position,
            content: pin.element,
            title,
          }),
        )
      })

      // The backend path may cover only pickup → first destination. Render it
      // exactly as supplied; never manufacture missing multi-stop legs.
      if (geography.route.length >= 2) {
        routePolylineRef.current = new window.google.maps.Polyline({
          map,
          path: geography.route,
          geodesic: true,
          strokeColor: '#7c3aed',
          strokeOpacity: 0.9,
          strokeWeight: 4,
        })
      }

      appliedGeographySignatureRef.current = geographySignature

      const shouldFitGeography =
        !initialViewportSetRef.current ||
        (!hasValidDriver && followingRef.current)
      if (shouldFitGeography) {
        const boundsPoints = collectBoundsCoordinates({
          driver,
          pickup: geography.pickup,
          destinations: geography.destinations.map(({ position }) => position),
          route: geography.route,
        })
        const bounds = new LatLngBounds()
        boundsPoints.forEach((point) => bounds.extend(point))

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, 64)
          if (boundsPoints.length <= 1) map.setZoom(DEFAULT_ZOOM)
        }
      }
      initialViewportSetRef.current = true
    } catch (error) {
      staticMarkersRef.current.forEach((marker) => {
        marker.map = null
      })
      staticMarkersRef.current = []
      routePolylineRef.current?.setMap(null)
      routePolylineRef.current = null
      setStatus('error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geographySignature, status])

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
      appliedGeographySignatureRef.current = null
      initialViewportSetRef.current = false
      carMarkerRef.current = null
      carInnerRef.current = null
      prevDriverRef.current = null
      advancedMarkerCtorRef.current = null
      pinCtorRef.current = null
      boundsCtorRef.current = null
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
