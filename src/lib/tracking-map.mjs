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

const DEFAULT_ROUTE_SNAP_METRES = 100
const DEFAULT_BACKTRACK_RESET_METRES = 250
const FORWARD_CANDIDATE_DISTANCE_SLACK_METRES = 30

function routePointAtProgress(route, segmentLengths, distanceMetres) {
  let travelled = 0
  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index]
    if (
      distanceMetres <= travelled + length ||
      index === segmentLengths.length - 1
    ) {
      const fraction = length > 0 ? (distanceMetres - travelled) / length : 0
      return {
        coordinate: interpolateCoordinate(
          route[index],
          route[index + 1],
          fraction,
        ),
        segmentIndex: index,
        segmentFraction: Math.min(1, Math.max(0, fraction)),
      }
    }
    travelled += length
  }
  return null
}

/**
 * Trims a provider route at the driver's nearest point on its polyline.
 * The returned path contains only provider coordinates plus the projected
 * point on a provider segment; it never adds a driver-to-route connector.
 */
export function getRemainingConsumerRoute({
  driver,
  route,
  previousProgress = null,
  maxSnapDistanceMetres = DEFAULT_ROUTE_SNAP_METRES,
  backtrackResetDistanceMetres = DEFAULT_BACKTRACK_RESET_METRES,
} = {}) {
  const normalizedRoute = Array.isArray(route)
    ? route.map(normalizeCoordinate).filter(Boolean)
    : []
  const normalizedDriver = normalizeCoordinate(driver)
  if (normalizedRoute.length < 2) {
    return {
      remainingRoute: [],
      progress: null,
      projectedCoordinate: null,
      distanceToRouteMetres: null,
      snapped: false,
    }
  }
  if (!normalizedDriver) {
    return {
      remainingRoute: normalizedRoute,
      progress: previousProgress,
      projectedCoordinate: null,
      distanceToRouteMetres: null,
      snapped: false,
    }
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180
  const referenceLatitude = toRadians(normalizedDriver.lat)
  const toLocal = (point) => ({
    x:
      EARTH_RADIUS_METRES *
      toRadians(point.lng - normalizedDriver.lng) *
      Math.cos(referenceLatitude),
    y: EARTH_RADIUS_METRES * toRadians(point.lat - normalizedDriver.lat),
  })
  const segmentLengths = []
  const candidates = []
  let distanceFromStart = 0

  for (let index = 0; index < normalizedRoute.length - 1; index += 1) {
    const start = normalizedRoute[index]
    const end = normalizedRoute[index + 1]
    const localStart = toLocal(start)
    const localEnd = toLocal(end)
    const dx = localEnd.x - localStart.x
    const dy = localEnd.y - localStart.y
    const squaredLength = dx * dx + dy * dy
    const segmentLength = Math.sqrt(squaredLength)
    segmentLengths.push(segmentLength)

    const fraction =
      squaredLength > 0
        ? Math.min(
            1,
            Math.max(
              0,
              -(localStart.x * dx + localStart.y * dy) / squaredLength,
            ),
          )
        : 0
    const projectedCoordinate = interpolateCoordinate(start, end, fraction)
    const projectedX = localStart.x + dx * fraction
    const projectedY = localStart.y + dy * fraction
    candidates.push({
      projectedCoordinate,
      segmentIndex: index,
      segmentFraction: fraction,
      distanceMetres: Math.hypot(projectedX, projectedY),
      distanceFromStartMetres: distanceFromStart + segmentLength * fraction,
    })
    distanceFromStart += segmentLength
  }

  const previousDistance = Number(previousProgress?.distanceFromStartMetres)
  const hasPreviousProgress = Number.isFinite(previousDistance)
  const forwardCandidates = hasPreviousProgress
    ? candidates.filter(
        (candidate) => candidate.distanceFromStartMetres >= previousDistance,
      )
    : candidates
  const globalNearest = candidates.reduce((best, candidate) =>
    !best || candidate.distanceMetres < best.distanceMetres ? candidate : best,
  )
  const forwardNearest = forwardCandidates.reduce(
    (best, candidate) =>
      !best || candidate.distanceMetres < best.distanceMetres
        ? candidate
        : best,
    null,
  )
  // Prefer geometry at/after established progress, especially at crossings.
  // If that forward geometry is no longer plausibly near the driver, fall
  // back to the global nearest candidate so a bad cursor cannot lock forever.
  const nearest =
    forwardNearest?.distanceMetres <= maxSnapDistanceMetres &&
    forwardNearest.distanceMetres <=
      globalNearest.distanceMetres + FORWARD_CANDIDATE_DISTANCE_SLACK_METRES
      ? forwardNearest
      : globalNearest

  if (!nearest || nearest.distanceMetres > maxSnapDistanceMetres) {
    return {
      remainingRoute: normalizedRoute,
      progress: previousProgress,
      projectedCoordinate: null,
      distanceToRouteMetres: nearest?.distanceMetres ?? null,
      snapped: false,
    }
  }

  let effectiveDistance = nearest.distanceFromStartMetres
  if (hasPreviousProgress && effectiveDistance < previousDistance) {
    const backwardDistance = previousDistance - effectiveDistance
    if (backwardDistance < backtrackResetDistanceMetres) {
      effectiveDistance = previousDistance
    }
  }
  const effectivePoint = routePointAtProgress(
    normalizedRoute,
    segmentLengths,
    effectiveDistance,
  )
  if (!effectivePoint) {
    return {
      remainingRoute: normalizedRoute,
      progress: previousProgress,
      projectedCoordinate: null,
      distanceToRouteMetres: nearest.distanceMetres,
      snapped: false,
    }
  }

  const suffix = normalizedRoute.slice(effectivePoint.segmentIndex + 1)
  const next = suffix[0]
  const remainingRoute =
    next && distanceBetweenCoordinates(effectivePoint.coordinate, next) < 0.01
      ? suffix
      : [effectivePoint.coordinate, ...suffix]

  return {
    remainingRoute,
    progress: {
      segmentIndex: effectivePoint.segmentIndex,
      segmentFraction: effectivePoint.segmentFraction,
      distanceFromStartMetres: effectiveDistance,
    },
    projectedCoordinate: effectivePoint.coordinate,
    distanceToRouteMetres: nearest.distanceMetres,
    snapped: true,
  }
}
