'use client'

import { useEffect, useRef, useState } from 'react'

// Reuse the same Maps key already used on the private tracking view.
// Hardcoded to match this repo's convention (see API_BASE_URL in page.jsx).
const GOOGLE_MAPS_API_KEY = 'AIzaSyA5Hf0alZULns0oB_VjhwOEQJog4LvYF1w'

// AdvancedMarkerElement requires a Map ID. 'DEMO_MAP_ID' works out of the
// box for development; swap in a production Map ID created in Cloud Console
// (Google Maps Platform > Map Management) before launch.
const MAP_ID = 'DEMO_MAP_ID'
const DEFAULT_ZOOM = 14

// Duplicated bootstrap loader — intentionally NOT shared with the private
// view's TrackingMap.jsx. Per this repo's "duplicate over shared-refactor"
// convention, keeping a private copy means the partner view can never regress
// the private /track/[trackingCode] map path. Google's current recommended
// inline bootstrap loader (loading=async): defines google.maps.importLibrary
// once; the JS is fetched lazily on the first importLibrary() call.
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

// The backend hands back coordinates in several shapes across fields
// (driverLocation/senderLocation use { latitude, longitude }; route
// coordinates may arrive as objects or [lng, lat] pairs). Normalise them all
// to Google's { lat, lng }. Returns null for anything unparseable so callers
// can filter it out.
function toLatLng(point) {
  if (!point) {
    return null
  }

  let lat
  let lng

  if (Array.isArray(point)) {
    // GeoJSON-style [longitude, latitude].
    lng = Number(point[0])
    lat = Number(point[1])
  } else {
    lat = Number(point.latitude ?? point.lat)
    lng = Number(point.longitude ?? point.lng)
  }

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null
  }

  return { lat, lng }
}

// Bearing from one point to the next, in degrees clockwise from north — used
// to rotate the car icon so it faces its direction of travel. Prefer a
// backend-provided heading when present; otherwise derive it from movement.
function computeHeading(from, to) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const toDeg = (rad) => (rad * 180) / Math.PI

  const lat1 = toRad(from.lat)
  const lat2 = toRad(to.lat)
  const dLng = toRad(to.lng - from.lng)

  const y = Math.sin(dLng) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)

  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

// A top-down car glyph. The outer wrapper is what AdvancedMarkerElement
// anchors; the inner element is rotated so the whole marker stays centred.
function createCarElement() {
  const wrapper = document.createElement('div')
  wrapper.style.width = '34px'
  wrapper.style.height = '34px'

  const inner = document.createElement('div')
  inner.style.width = '100%'
  inner.style.height = '100%'
  inner.style.transformOrigin = 'center'
  inner.style.transition = 'transform 300ms ease-out'
  inner.style.display = 'flex'
  inner.style.alignItems = 'center'
  inner.style.justifyContent = 'center'
  inner.innerHTML = `
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#ffffff" stroke="#7c3aed" stroke-width="1.5"/>
      <path d="M12 4l4 6h-8l4-6z" fill="#7c3aed"/>
      <rect x="8" y="9" width="8" height="9" rx="2" fill="#7c3aed"/>
      <rect x="9" y="10.5" width="6" height="3" rx="1" fill="#ffffff"/>
    </svg>`

  wrapper.appendChild(inner)
  return { wrapper, inner }
}

export function PartnerTrackingMap({
  driverLocation,
  senderLocation,
  receivers,
  route,
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const advancedMarkerCtorRef = useRef(null)
  const carMarkerRef = useRef(null)
  const carInnerRef = useRef(null)
  const prevDriverRef = useRef(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  const driver = toLatLng(driverLocation)
  const hasValidDriver = driver != null

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
        ensureMapsBootstrap()

        const [{ Map }, { AdvancedMarkerElement, PinElement }, { LatLngBounds }] =
          await Promise.all([
            window.google.maps.importLibrary('maps'),
            window.google.maps.importLibrary('marker'),
            window.google.maps.importLibrary('core'),
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
          .map(toLatLng)
          .filter(Boolean)

        const sender = toLatLng(senderLocation)
        const receiverList = Array.isArray(receivers) ? receivers : []
        const receiverPositions = receiverList.map((receiver) =>
          toLatLng(receiver?.receiverLocation ?? receiver),
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
        let pointCount = 0
        const extend = (point) => {
          bounds.extend(point)
          pointCount += 1
        }

        if (routePath.length >= 2) {
          const polyline = new window.google.maps.Polyline({
            path: routePath,
            geodesic: true,
            strokeColor: '#7c3aed',
            strokeOpacity: 0.9,
            strokeWeight: 4,
          })
          polyline.setMap(map)
          routePath.forEach(extend)
        }

        // Pickup pin (sender).
        if (sender) {
          const pickupPin = new PinElement({
            background: '#10b981',
            borderColor: '#047857',
            glyphColor: '#ffffff',
            glyph: 'A',
          })
          new AdvancedMarkerElement({
            map,
            position: sender,
            content: pickupPin.element,
            title: 'Pickup',
          })
          extend(sender)
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
          new AdvancedMarkerElement({
            map,
            position,
            content: pin.element,
            title: receiver?.receiverName || `Stop ${index + 1}`,
          })
          extend(position)
        })

        // Car marker for the live driver position, if already assigned. If
        // the driver is assigned later, the update effect below creates it.
        if (driver) {
          const { wrapper, inner } = createCarElement()
          const initialHeading = Number(driverLocation?.heading)
          if (!Number.isNaN(initialHeading)) {
            inner.style.transform = `rotate(${initialHeading}deg)`
          }
          carMarkerRef.current = new AdvancedMarkerElement({
            map,
            position: driver,
            content: wrapper,
            title: 'Driver',
          })
          carInnerRef.current = inner
          prevDriverRef.current = driver
          extend(driver)
        }

        mapInstanceRef.current = map

        // Frame everything on first paint; a single-point bounds makes
        // fitBounds over-zoom, so fall back to a sensible default instead.
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, 64)
          if (pointCount <= 1) {
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

      const { wrapper, inner } = createCarElement()
      const initialHeading = Number(driverLocation?.heading)
      if (!Number.isNaN(initialHeading)) {
        inner.style.transform = `rotate(${initialHeading}deg)`
      }
      carMarkerRef.current = new advancedMarkerCtorRef.current({
        map: mapInstanceRef.current,
        position: driver,
        content: wrapper,
        title: 'Driver',
      })
      carInnerRef.current = inner
      prevDriverRef.current = driver
      mapInstanceRef.current.panTo(driver)
      return
    }

    carMarkerRef.current.position = driver
    mapInstanceRef.current.panTo(driver)

    const backendHeading = Number(driverLocation?.heading)
    let heading = Number.isNaN(backendHeading) ? null : backendHeading

    if (heading == null && prevDriverRef.current) {
      const prev = prevDriverRef.current
      if (prev.lat !== driver.lat || prev.lng !== driver.lng) {
        heading = computeHeading(prev, driver)
      }
    }

    if (heading != null && carInnerRef.current) {
      carInnerRef.current.style.transform = `rotate(${heading}deg)`
    }

    prevDriverRef.current = driver
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver?.lat, driver?.lng, hasValidDriver, status])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        Live Route
      </p>
      <div className="relative mt-4 h-80 w-full overflow-hidden rounded-2xl bg-slate-100">
        <div
          ref={mapRef}
          className="h-full w-full"
          aria-label="Map showing the driver's live position along the delivery route"
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
