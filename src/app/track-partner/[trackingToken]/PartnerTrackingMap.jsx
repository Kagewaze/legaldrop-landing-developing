'use client'

import { useEffect, useRef, useState } from 'react'

import { importMapsLibrary, subscribeMapsAuthFailure } from '@/lib/maps-loader'
import {
  collectBoundsCoordinates,
  distanceBetweenCoordinates,
  getPartnerGeography,
  getPartnerGeographySignature,
  normalizeCoordinate,
  resolveDriverHeading,
} from '@/lib/tracking-map.mjs'
import {
  animateDriverMarker,
  createDriverMarker,
  observeMapInteraction,
  setDriverMarkerHeading,
} from '@/lib/tracking-map-browser'
import { TrackingMapRecenter } from '@/components/track/TrackingMapRecenter'

// Production Cloud Console Map ID for the legal-drop project. Vector map —
// required by AdvancedMarkerElement.
const MAP_ID = 'ea0f34dfd1b56b44758f5576'
const DEFAULT_ZOOM = 15

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
  const animatedDriverRef = useRef(null)
  const cancelMarkerAnimationRef = useRef(null)
  const staticMarkersRef = useRef([])
  const routePolylinesRef = useRef([])
  const appliedGeographySignatureRef = useRef(null)
  const initialViewportSetRef = useRef(false)
  const followingRef = useRef(true)
  const mapUnavailableRef = useRef(false)
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

  function markMapUnavailable(error, context) {
    if (mapUnavailableRef.current) return

    mapUnavailableRef.current = true
    cancelMarkerAnimationRef.current?.()
    cancelMarkerAnimationRef.current = null
    followingRef.current = false
    setFollowing(false)
    setStatus('error')
    console.error(
      `[partner-tracking-map] Google Maps ${context}; map disabled.`,
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
      const zoom = mapInstanceRef.current.getZoom()
      if (!Number.isFinite(zoom) || zoom < 13 || zoom > 18) {
        mapInstanceRef.current.setZoom(DEFAULT_ZOOM)
      }
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
        const [
          { Map },
          { AdvancedMarkerElement, PinElement },
          { LatLngBounds },
        ] = await Promise.all([
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

        let map
        const mapCreated = runMapOperation('initialization failed', () => {
          map = new Map(mapRef.current, {
            center: initialCenter,
            zoom: DEFAULT_ZOOM,
            mapId: MAP_ID,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',
          })
        })
        if (!mapCreated || cancelled) return

        // Car marker for the live driver position, if already assigned. If
        // the driver is assigned later, the update effect below creates it.
        if (driver) {
          let markerResult
          const markerCreated = runMapOperation(
            'driver marker creation failed',
            () => {
              markerResult = createDriverMarker({
                AdvancedMarkerElement,
                map,
                position: driver,
                heading: resolveDriverHeading({
                  backendHeading: driverLocation?.heading,
                  previous: null,
                  current: driver,
                }),
              })
            },
          )
          if (!markerCreated) return
          const { marker, vehicle } = markerResult
          carMarkerRef.current = marker
          carInnerRef.current = vehicle
          prevDriverRef.current = driver
          animatedDriverRef.current = driver
        }

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

    runMapOperation('geography update failed', () => {
      staticMarkersRef.current.forEach((marker) => {
        marker.map = null
      })
      staticMarkersRef.current = []
      routePolylinesRef.current.forEach((polyline) => polyline.setMap(null))
      routePolylinesRef.current = []

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
        const routeOptions = {
          map,
          path: geography.route,
          geodesic: true,
          clickable: false,
        }
        routePolylinesRef.current = [
          new window.google.maps.Polyline({
            ...routeOptions,
            strokeColor: '#eadcf4',
            strokeOpacity: 0.9,
            strokeWeight: 10,
            zIndex: 1,
          }),
          new window.google.maps.Polyline({
            ...routeOptions,
            strokeColor: '#7B2FBE',
            strokeOpacity: 0.92,
            strokeWeight: 5,
            zIndex: 2,
          }),
        ]
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
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geographySignature, status])

  // Move + rotate the car on each driver update, panning to keep it in view.
  // Prefer a backend heading; otherwise derive it from the movement delta.
  // Also handles the driver appearing for the first time after initial map
  // load (order went from pending → ongoing mid-poll): the car marker is
  // created here rather than at init in that case.
  useEffect(() => {
    if (
      !hasValidDriver ||
      status !== 'ready' ||
      !mapInstanceRef.current ||
      mapUnavailableRef.current
    ) {
      return
    }

    if (!carMarkerRef.current) {
      if (!advancedMarkerCtorRef.current) {
        return
      }

      let markerResult
      const markerCreated = runMapOperation(
        'driver marker creation failed',
        () => {
          markerResult = createDriverMarker({
            AdvancedMarkerElement: advancedMarkerCtorRef.current,
            map: mapInstanceRef.current,
            position: driver,
            heading: resolveDriverHeading({
              backendHeading: driverLocation?.heading,
              previous: null,
              current: driver,
            }),
          })
        },
      )
      if (!markerCreated) return
      const { marker, vehicle } = markerResult
      carMarkerRef.current = marker
      carInnerRef.current = vehicle
      prevDriverRef.current = driver
      animatedDriverRef.current = driver
      if (followingRef.current) {
        runMapOperation('driver follow failed', () => {
          mapInstanceRef.current.panTo(driver)
        })
      }
      return
    }

    const previous = prevDriverRef.current
    const distance = distanceBetweenCoordinates(previous, driver)
    const moved = distance != null && distance >= 1
    const heading = resolveDriverHeading({
      backendHeading: driverLocation?.heading,
      previous,
      current: driver,
    })
    const updated = runMapOperation('driver update failed', () => {
      setDriverMarkerHeading(carInnerRef.current, heading)

      if (moved && followingRef.current) {
        mapInstanceRef.current.panTo(driver)
      }
    })

    if (updated && moved) {
      cancelMarkerAnimationRef.current?.()
      cancelMarkerAnimationRef.current = animateDriverMarker({
        marker: carMarkerRef.current,
        from: animatedDriverRef.current ?? previous,
        to: driver,
        onPosition: (position) => {
          animatedDriverRef.current = position
        },
        onError: (error) =>
          markMapUnavailable(error, 'driver animation failed'),
      })
      prevDriverRef.current = driver
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    driver?.lat,
    driver?.lng,
    driverLocation?.heading,
    hasValidDriver,
    status,
  ])

  useEffect(() => {
    return () => {
      cancelMarkerAnimationRef.current?.()
      cancelMarkerAnimationRef.current = null
      try {
        staticMarkersRef.current.forEach((marker) => {
          marker.map = null
        })
        if (carMarkerRef.current) carMarkerRef.current.map = null
        routePolylinesRef.current.forEach((polyline) => polyline.setMap(null))
      } catch (error) {
        // An unauthorized Maps runtime can reject teardown mutations too. The
        // container is being removed, so clearing local references is enough.
      }
      staticMarkersRef.current = []
      routePolylinesRef.current = []
      appliedGeographySignatureRef.current = null
      initialViewportSetRef.current = false
      carMarkerRef.current = null
      carInnerRef.current = null
      prevDriverRef.current = null
      animatedDriverRef.current = null
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
    <section className="overflow-hidden rounded-card border border-[#d9c7e6] bg-surface-raised shadow-[0_2px_4px_rgba(82,28,130,0.06),0_18px_42px_-24px_rgba(82,28,130,0.38)]">
      <h2 className="sr-only">
        {isLive ? 'Live delivery route' : 'Delivery route and final positions'}
      </h2>
      <div className="relative h-[clamp(360px,50vh,560px)] w-full bg-[#f3eafa] lg:h-[clamp(520px,62vh,720px)]">
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
