import { easeInOutCubic, interpolateCoordinate } from '@/lib/tracking-map.mjs'

export function createDriverMarkerElement() {
  const wrapper = document.createElement('div')
  wrapper.style.width = '36px'
  wrapper.style.height = '42px'
  wrapper.style.filter = 'drop-shadow(0 5px 7px rgba(40, 22, 50, 0.24))'

  const vehicle = document.createElement('div')
  vehicle.style.width = '100%'
  vehicle.style.height = '100%'
  vehicle.style.transformOrigin = 'center'
  vehicle.style.transition = 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)'
  vehicle.style.display = 'flex'
  vehicle.style.alignItems = 'center'
  vehicle.style.justifyContent = 'center'
  vehicle.innerHTML = `
    <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="18" cy="21" r="17" fill="#ffffff" stroke="#d9c7e6" stroke-width="1.5"/>
      <path d="M18 5.5 20.8 9h-5.6L18 5.5Z" fill="#7B2FBE"/>
      <rect x="12.5" y="10" width="11" height="22" rx="5" fill="#281632"/>
      <path d="M14.2 15.1c.25-1.7 1.1-2.8 2.4-3.2h2.8c1.3.4 2.15 1.5 2.4 3.2l.35 2.4h-8.3l.35-2.4Z" fill="#f4eafb"/>
      <path d="M13.8 20h8.4v7.2a3 3 0 0 1-3 3h-2.4a3 3 0 0 1-3-3V20Z" fill="#7B2FBE"/>
      <rect x="10.8" y="15.5" width="2" height="5" rx="1" fill="#281632"/>
      <rect x="23.2" y="15.5" width="2" height="5" rx="1" fill="#281632"/>
      <rect x="10.8" y="23.5" width="2" height="5" rx="1" fill="#281632"/>
      <rect x="23.2" y="23.5" width="2" height="5" rx="1" fill="#281632"/>
      <circle cx="15.2" cy="28" r="1" fill="#ffffff"/>
      <circle cx="20.8" cy="28" r="1" fill="#ffffff"/>
    </svg>`

  wrapper.appendChild(vehicle)
  return { wrapper, vehicle }
}

export function createDriverMarker({
  AdvancedMarkerElement,
  map,
  position,
  heading,
}) {
  const { wrapper, vehicle } = createDriverMarkerElement()
  setDriverMarkerHeading(vehicle, heading)

  return {
    marker: new AdvancedMarkerElement({
      map,
      position,
      content: wrapper,
      title: 'Driver',
      anchorLeft: '-50%',
      anchorTop: '-50%',
      zIndex: 20,
    }),
    vehicle,
  }
}

export function setDriverMarkerHeading(vehicle, heading) {
  if (vehicle && heading != null) {
    const previous = Number(vehicle.dataset.heading)
    const normalized = ((heading % 360) + 360) % 360
    const displayed = Number.isFinite(previous)
      ? previous + (((((normalized - previous) % 360) + 540) % 360) - 180)
      : normalized
    vehicle.dataset.heading = String(displayed)
    vehicle.style.transform = `rotate(${displayed}deg)`
  }
}

export function animateDriverMarker({
  marker,
  from,
  to,
  duration = 1800,
  onPosition,
  onError,
}) {
  if (!marker || !from || !to || typeof requestAnimationFrame !== 'function') {
    return () => {}
  }

  let animationFrame = null
  let cancelled = false
  const startedAt = performance.now()

  const update = (timestamp) => {
    if (cancelled) return
    const progress = Math.min(1, (timestamp - startedAt) / duration)

    try {
      const position = interpolateCoordinate(from, to, easeInOutCubic(progress))
      marker.position = position
      onPosition?.(position)
    } catch (error) {
      cancelled = true
      onError?.(error)
      return
    }

    if (progress < 1) animationFrame = requestAnimationFrame(update)
  }

  animationFrame = requestAnimationFrame(update)
  return () => {
    cancelled = true
    if (animationFrame != null) cancelAnimationFrame(animationFrame)
  }
}

export function observeMapInteraction(element, onInteraction) {
  const events = ['pointerdown', 'wheel', 'touchstart', 'keydown']
  const mapNavigationKeys = new Set([
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    '+',
    '-',
    '=',
    'PageUp',
    'PageDown',
    'Home',
    'End',
  ])
  const handleInteraction = (event) => {
    if (event.type === 'keydown' && !mapNavigationKeys.has(event.key)) return
    onInteraction(event)
  }
  events.forEach((event) =>
    element.addEventListener(event, handleInteraction, { capture: true }),
  )

  return () => {
    events.forEach((event) =>
      element.removeEventListener(event, handleInteraction, { capture: true }),
    )
  }
}
