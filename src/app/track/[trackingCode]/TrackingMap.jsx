'use client'

import { useEffect, useRef, useState } from 'react'

import { importMapsLibrary, subscribeMapsAuthFailure } from '@/lib/maps-loader'
import {
  computeMovementHeading,
  collectBoundsCoordinates,
  distanceBetweenCoordinates,
  getConsumerRouteGeography,
  getConsumerRouteGeographySignature,
  getRemainingConsumerRoute,
  normalizeCoordinate,
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
const DEFAULT_ZOOM = 16
const MAX_JOURNEY_ZOOM = 17
const CAMERA_MOVEMENT_THRESHOLD_METRES = 30

export function TrackingMap({
  driverLocation,
  destinationLocation,
  route,
  isLive = true,
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const markerVehicleRef = useRef(null)
  const advancedMarkerCtorRef = useRef(null)
  const pinCtorRef = useRef(null)
  const boundsCtorRef = useRef(null)
  const destinationMarkerRef = useRef(null)
  const routePolylinesRef = useRef([])
  const appliedDestinationSignatureRef = useRef(null)
  const authoritativeRouteRef = useRef([])
  const remainingRouteRef = useRef([])
  const routeProgressRef = useRef(null)
  const showingAuthoritativeRouteRef = useRef(false)
  const appliedRouteSignatureRef = useRef(null)
  const initialJourneyFramedRef = useRef(false)
  const lastCameraDriverRef = useRef(null)
  const cameraIdleListenerRef = useRef(null)
  const previousDriverRef = useRef(null)
  const animatedDriverRef = useRef(null)
  const cancelMarkerAnimationRef = useRef(null)
  const followingRef = useRef(true)
  const mapUnavailableRef = useRef(false)
  const [following, setFollowing] = useState(true)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  const driver = normalizeCoordinate(driverLocation)
  const hasValidCoords = driver != null
  const geography = getConsumerRouteGeography({
    destinationLocation,
    route,
  })
  const routeSignature = getConsumerRouteGeographySignature(geography)
  const hasMapContent = hasValidCoords || geography.destination != null

  function markMapUnavailable(error, context) {
    if (mapUnavailableRef.current) return

    mapUnavailableRef.current = true
    cancelMarkerAnimationRef.current?.()
    cancelMarkerAnimationRef.current = null
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

  function updateVisibleRoute(driverPosition) {
    if (
      mapUnavailableRef.current ||
      authoritativeRouteRef.current.length < 2 ||
      routePolylinesRef.current.length === 0
    ) {
      return remainingRouteRef.current
    }

    const projection = getRemainingConsumerRoute({
      driver: driverPosition,
      route: authoritativeRouteRef.current,
      previousProgress: routeProgressRef.current,
    })
    if (!projection.snapped) {
      if (!showingAuthoritativeRouteRef.current) {
        const restored = runMapOperation(
          'route snap safety update failed',
          () => {
            routePolylinesRef.current.forEach((polyline) =>
              polyline.setPath(projection.remainingRoute),
            )
          },
        )
        if (restored) {
          remainingRouteRef.current = projection.remainingRoute
          showingAuthoritativeRouteRef.current = true
        }
      }
      return remainingRouteRef.current
    }

    const previousDistance = Number(
      routeProgressRef.current?.distanceFromStartMetres,
    )
    if (
      Number.isFinite(previousDistance) &&
      !showingAuthoritativeRouteRef.current &&
      projection.progress.distanceFromStartMetres - previousDistance < 0.02
    ) {
      return remainingRouteRef.current
    }

    const updated = runMapOperation('route progress update failed', () => {
      routePolylinesRef.current.forEach((polyline) =>
        polyline.setPath(projection.remainingRoute),
      )
    })
    if (updated) {
      routeProgressRef.current = projection.progress
      remainingRouteRef.current = projection.remainingRoute
      showingAuthoritativeRouteRef.current = false
    }
    return remainingRouteRef.current
  }

  function frameActiveJourney(driverPosition = driver) {
    const map = mapInstanceRef.current
    const LatLngBounds = boundsCtorRef.current
    if (
      !map ||
      !LatLngBounds ||
      !driverPosition ||
      !geography.destination ||
      mapUnavailableRef.current
    ) {
      return false
    }

    return runMapOperation('journey framing failed', () => {
      const projectedRoute = getRemainingConsumerRoute({
        driver: driverPosition,
        route: authoritativeRouteRef.current,
        previousProgress: routeProgressRef.current,
      })
      const framingRoute = projectedRoute.snapped
        ? projectedRoute.remainingRoute
        : remainingRouteRef.current
      const points = collectBoundsCoordinates({
        driver: driverPosition,
        destinations: [geography.destination],
        route: framingRoute,
      })
      const bounds = new LatLngBounds()
      points.forEach((point) => bounds.extend(point))
      map.fitBounds(bounds, { top: 72, right: 64, bottom: 72, left: 64 })

      cameraIdleListenerRef.current?.remove()
      cameraIdleListenerRef.current = map.addListener('idle', () => {
        cameraIdleListenerRef.current?.remove()
        cameraIdleListenerRef.current = null
        if (!followingRef.current || mapUnavailableRef.current) return
        runMapOperation('journey zoom adjustment failed', () => {
          const zoom = map.getZoom()
          if (Number.isFinite(zoom) && zoom > MAX_JOURNEY_ZOOM) {
            map.setZoom(MAX_JOURNEY_ZOOM)
          }
        })
      })
      lastCameraDriverRef.current = driverPosition
      initialJourneyFramedRef.current = true
    })
  }

  function recenter() {
    if (!driver || !mapInstanceRef.current || mapUnavailableRef.current) return
    followingRef.current = true
    setFollowing(true)
    runMapOperation('recenter failed', () => {
      if (geography.destination) {
        const currentPosition = animatedDriverRef.current ?? driver
        updateVisibleRoute(currentPosition)
        frameActiveJourney(currentPosition)
        return
      }
      const zoom = mapInstanceRef.current.getZoom()
      if (!Number.isFinite(zoom) || zoom < 14 || zoom > 18) {
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

  // Initialise the map + marker exactly once. The bootstrap loader / Map ID
  // logic is reused untouched; later coordinate changes only pan the map.
  useEffect(() => {
    if (!hasMapContent) {
      setStatus('error')
      return undefined
    }

    if (mapInstanceRef.current) {
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

        let map
        let markerResult
        advancedMarkerCtorRef.current = AdvancedMarkerElement
        pinCtorRef.current = PinElement
        boundsCtorRef.current = LatLngBounds
        const initialized = runMapOperation('initialization failed', () => {
          map = new Map(mapRef.current, {
            center: driver ?? geography.destination,
            zoom: DEFAULT_ZOOM,
            mapId: MAP_ID,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          })
          if (driver) {
            markerResult = createDriverMarker({
              AdvancedMarkerElement,
              map,
              position: driver,
              heading: null,
            })
          }
        })
        if (!initialized || cancelled) return

        if (markerResult) {
          const { marker, vehicle } = markerResult
          markerRef.current = marker
          markerVehicleRef.current = vehicle
          previousDriverRef.current = driver
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMapContent])

  // Destination and provider-supplied route are reconciled separately from
  // the moving driver. Equivalent fresh polling objects are a no-op.
  useEffect(() => {
    const map = mapInstanceRef.current
    const AdvancedMarkerElement = advancedMarkerCtorRef.current
    const PinElement = pinCtorRef.current
    if (
      status !== 'ready' ||
      !map ||
      !AdvancedMarkerElement ||
      !PinElement ||
      appliedRouteSignatureRef.current === routeSignature
    ) {
      return
    }

    runMapOperation('route update failed', () => {
      authoritativeRouteRef.current = geography.route
      routeProgressRef.current = null
      const projection = getRemainingConsumerRoute({
        driver: animatedDriverRef.current ?? driver,
        route: geography.route,
      })
      remainingRouteRef.current = projection.snapped
        ? projection.remainingRoute
        : geography.route
      routeProgressRef.current = projection.snapped ? projection.progress : null
      showingAuthoritativeRouteRef.current = !projection.snapped

      const destinationSignature = geography.destination
        ? `${geography.destination.lat},${geography.destination.lng}`
        : null
      if (appliedDestinationSignatureRef.current !== destinationSignature) {
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.map = null
          destinationMarkerRef.current = null
        }
        if (geography.destination) {
          const destinationPin = new PinElement({
            background: '#7B2FBE',
            borderColor: '#4f176f',
            glyphColor: '#ffffff',
            glyph: 'B',
            scale: 0.95,
          })
          destinationMarkerRef.current = new AdvancedMarkerElement({
            map,
            position: geography.destination,
            content: destinationPin.element,
            title: 'Delivery destination',
            zIndex: 10,
          })
        }
        appliedDestinationSignatureRef.current = destinationSignature
      }

      if (geography.route.length >= 2) {
        if (routePolylinesRef.current.length === 2) {
          routePolylinesRef.current.forEach((polyline) => {
            polyline.setMap(map)
            polyline.setPath(remainingRouteRef.current)
          })
        } else {
          const routeOptions = {
            map,
            path: remainingRouteRef.current,
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
      } else {
        routePolylinesRef.current.forEach((polyline) => polyline.setMap(null))
        routePolylinesRef.current = []
      }

      appliedRouteSignatureRef.current = routeSignature
      if (driver && followingRef.current) {
        frameActiveJourney(driver)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSignature, status])

  // Move the existing marker in place. Movement supplies a conservative
  // heading because the consumer payload has no heading field. Camera updates
  // happen only while follow mode remains enabled.
  useEffect(() => {
    if (!driver || !mapInstanceRef.current || mapUnavailableRef.current) {
      return
    }

    if (!markerRef.current) {
      if (!advancedMarkerCtorRef.current) return
      let markerResult
      const created = runMapOperation('driver marker creation failed', () => {
        markerResult = createDriverMarker({
          AdvancedMarkerElement: advancedMarkerCtorRef.current,
          map: mapInstanceRef.current,
          position: driver,
          heading: null,
        })
      })
      if (!created) return
      markerRef.current = markerResult.marker
      markerVehicleRef.current = markerResult.vehicle
      previousDriverRef.current = driver
      animatedDriverRef.current = driver
      if (followingRef.current) {
        if (geography.destination) frameActiveJourney(driver)
        else
          runMapOperation('driver follow failed', () => {
            mapInstanceRef.current.panTo(driver)
          })
      }
      return
    }

    const previous = previousDriverRef.current
    const distance = distanceBetweenCoordinates(previous, driver)
    if (distance == null || distance < 1) return

    const heading = computeMovementHeading(previous, driver)
    const updated = runMapOperation('driver update failed', () => {
      setDriverMarkerHeading(markerVehicleRef.current, heading)

      if (followingRef.current && !geography.destination) {
        mapInstanceRef.current.panTo(driver)
      }
    })

    if (updated) {
      cancelMarkerAnimationRef.current?.()
      cancelMarkerAnimationRef.current = animateDriverMarker({
        marker: markerRef.current,
        from: animatedDriverRef.current ?? previous,
        to: driver,
        onPosition: (position) => {
          animatedDriverRef.current = position
          updateVisibleRoute(position)
        },
        onError: (error) =>
          markMapUnavailable(error, 'driver animation failed'),
      })
      previousDriverRef.current = driver

      const cameraDistance = distanceBetweenCoordinates(
        lastCameraDriverRef.current,
        driver,
      )
      if (
        followingRef.current &&
        geography.destination &&
        (!initialJourneyFramedRef.current ||
          cameraDistance == null ||
          cameraDistance >= CAMERA_MOVEMENT_THRESHOLD_METRES)
      ) {
        frameActiveJourney(driver)
      }
    }
    // The normalized `driver` object is recreated during render. Coordinates
    // are the intentional update contract; depending on the object would rerun
    // this Google mutation after unrelated state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver?.lat, driver?.lng])

  useEffect(() => {
    return () => {
      cancelMarkerAnimationRef.current?.()
      cancelMarkerAnimationRef.current = null
      try {
        cameraIdleListenerRef.current?.remove()
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.map = null
        }
        routePolylinesRef.current.forEach((polyline) => polyline.setMap(null))
        if (markerRef.current) markerRef.current.map = null
      } catch (error) {
        // An unauthorized Maps runtime can reject teardown mutations too. The
        // container is being removed, so clearing local references is enough.
      }
      markerRef.current = null
      destinationMarkerRef.current = null
      appliedDestinationSignatureRef.current = null
      routePolylinesRef.current = []
      authoritativeRouteRef.current = []
      remainingRouteRef.current = []
      routeProgressRef.current = null
      showingAuthoritativeRouteRef.current = false
      appliedRouteSignatureRef.current = null
      initialJourneyFramedRef.current = false
      lastCameraDriverRef.current = null
      cameraIdleListenerRef.current = null
      markerVehicleRef.current = null
      previousDriverRef.current = null
      animatedDriverRef.current = null
      mapInstanceRef.current = null
      advancedMarkerCtorRef.current = null
      pinCtorRef.current = null
      boundsCtorRef.current = null
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
        {status === 'ready' && !following && driver ? (
          <TrackingMapRecenter
            onClick={recenter}
            label={
              isLive
                ? geography.destination
                  ? 'Recenter map on active delivery journey'
                  : 'Recenter map on driver'
                : 'Recenter map on last known driver position'
            }
          />
        ) : null}
      </div>
    </section>
  )
}
