const EARTH_RADIUS_METRES = 6_371_000

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function normalizeCoordinate(point) {
  if (!point) return null

  const lat = finiteNumber(
    Array.isArray(point) ? point[1] : point.latitude ?? point.lat,
  )
  const lng = finiteNumber(
    Array.isArray(point) ? point[0] : point.longitude ?? point.lng,
  )

  if (lat === null || lng === null) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

  return { lat, lng }
}

export function easeInOutCubic(progress) {
  const value = Math.min(1, Math.max(0, Number(progress) || 0))
  return value < 0.5 ? 4 * value ** 3 : 1 - Math.pow(-2 * value + 2, 3) / 2
}

export function interpolateCoordinate(fromValue, toValue, progress) {
  const from = normalizeCoordinate(fromValue)
  const to = normalizeCoordinate(toValue)
  if (!from || !to) return null

  const amount = Math.min(1, Math.max(0, Number(progress) || 0))
  return {
    lat: from.lat + (to.lat - from.lat) * amount,
    lng: from.lng + (to.lng - from.lng) * amount,
  }
}

export function distanceBetweenCoordinates(fromValue, toValue) {
  const from = normalizeCoordinate(fromValue)
  const to = normalizeCoordinate(toValue)
  if (!from || !to) return null

  const toRadians = (degrees) => (degrees * Math.PI) / 180
  const latitudeDelta = toRadians(to.lat - from.lat)
  const longitudeDelta = toRadians(to.lng - from.lng)
  const fromLatitude = toRadians(from.lat)
  const toLatitude = toRadians(to.lat)

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2

  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.sqrt(haversine))
}

export function computeMovementHeading(fromValue, toValue, minimumMetres = 1) {
  const from = normalizeCoordinate(fromValue)
  const to = normalizeCoordinate(toValue)
  if (!from || !to) return null

  const distance = distanceBetweenCoordinates(from, to)
  if (distance === null || distance < minimumMetres) return null

  const toRadians = (degrees) => (degrees * Math.PI) / 180
  const toDegrees = (radians) => (radians * 180) / Math.PI
  const fromLatitude = toRadians(from.lat)
  const toLatitude = toRadians(to.lat)
  const longitudeDelta = toRadians(to.lng - from.lng)
  const y = Math.sin(longitudeDelta) * Math.cos(toLatitude)
  const x =
    Math.cos(fromLatitude) * Math.sin(toLatitude) -
    Math.sin(fromLatitude) * Math.cos(toLatitude) * Math.cos(longitudeDelta)

  return (toDegrees(Math.atan2(y, x)) + 360) % 360
}

export function normalizeHeading(value) {
  const heading = finiteNumber(value)
  if (heading === null || heading < 0 || heading > 360) return null
  return heading === 360 ? 0 : heading
}

export function resolveDriverHeading({ backendHeading, previous, current }) {
  return (
    normalizeHeading(backendHeading) ??
    computeMovementHeading(previous, current)
  )
}

export function collectBoundsCoordinates({
  driver,
  pickup,
  destinations = [],
  route = [],
} = {}) {
  return [pickup, ...destinations, ...route, driver]
    .map(normalizeCoordinate)
    .filter(Boolean)
}

export function getPartnerGeography({
  senderLocation,
  receivers = [],
  route,
} = {}) {
  const receiverList = Array.isArray(receivers) ? receivers : []
  const routeCoordinates = Array.isArray(route?.coordinates)
    ? route.coordinates
    : []

  return {
    pickup: normalizeCoordinate(senderLocation),
    destinations: receiverList
      .map((receiver, index) => {
        const position = normalizeCoordinate(
          receiver?.receiverLocation ?? receiver,
        )
        if (!position) return null

        return {
          position,
          stopNumber: index + 1,
          title:
            typeof receiver?.receiverName === 'string' &&
            receiver.receiverName.trim()
              ? receiver.receiverName.trim()
              : `Stop ${index + 1}`,
        }
      })
      .filter(Boolean),
    route: routeCoordinates.map(normalizeCoordinate).filter(Boolean),
  }
}

export function getPartnerGeographySignature(geography) {
  const pickup = normalizeCoordinate(geography?.pickup)
  const destinations = Array.isArray(geography?.destinations)
    ? geography.destinations
    : []
  const route = Array.isArray(geography?.route) ? geography.route : []

  return JSON.stringify({
    pickup: pickup ? [pickup.lat, pickup.lng] : null,
    destinations: destinations
      .map((destination) => {
        const position = normalizeCoordinate(
          destination?.position ?? destination,
        )
        if (!position) return null
        return [
          Number(destination?.stopNumber) || null,
          position.lat,
          position.lng,
          typeof destination?.title === 'string' ? destination.title : '',
        ]
      })
      .filter(Boolean),
    route: route
      .map(normalizeCoordinate)
      .filter(Boolean)
      .map(({ lat, lng }) => [lat, lng]),
  })
}

export function getConsumerRouteGeography({ destinationLocation, route } = {}) {
  const destination = normalizeCoordinate(destinationLocation)
  const routeCoordinates = Array.isArray(route?.coordinates)
    ? route.coordinates.map(normalizeCoordinate).filter(Boolean)
    : []

  return {
    destination,
    // The destination field is the authority for this privacy-scoped route.
    // Never infer it from the final polyline coordinate.
    route: destination && routeCoordinates.length >= 2 ? routeCoordinates : [],
  }
}

export function getConsumerRouteGeographySignature(geography) {
  const destination = normalizeCoordinate(geography?.destination)
  const route = Array.isArray(geography?.route) ? geography.route : []

  return JSON.stringify({
    destination: destination ? [destination.lat, destination.lng] : null,
    route: route
      .map(normalizeCoordinate)
      .filter(Boolean)
      .map(({ lat, lng }) => [lat, lng]),
  })
}
