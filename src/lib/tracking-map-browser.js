export function createDriverMarkerElement() {
  const wrapper = document.createElement('div')
  wrapper.style.width = '38px'
  wrapper.style.height = '38px'

  const vehicle = document.createElement('div')
  vehicle.style.width = '100%'
  vehicle.style.height = '100%'
  vehicle.style.transformOrigin = 'center'
  vehicle.style.transition = 'transform 300ms ease-out'
  vehicle.style.display = 'flex'
  vehicle.style.alignItems = 'center'
  vehicle.style.justifyContent = 'center'
  vehicle.innerHTML = `
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#ffffff" stroke="#7c3aed" stroke-width="1.5"/>
      <path d="M12 4l4 6h-8l4-6z" fill="#7c3aed"/>
      <rect x="8" y="9" width="8" height="9" rx="2" fill="#7c3aed"/>
      <rect x="9" y="10.5" width="6" height="3" rx="1" fill="#ffffff"/>
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
    }),
    vehicle,
  }
}

export function setDriverMarkerHeading(vehicle, heading) {
  if (vehicle && heading != null) {
    vehicle.style.transform = `rotate(${heading}deg)`
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
