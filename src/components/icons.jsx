// Geometric silhouette icon set.
//
// Every icon is a solid shape at a 24x24 viewBox with its interior detail cut
// out via fill-rule="evenodd" — no strokes, no thin lines. That is what keeps
// them legible at 20px inside a 36px tile, which is the smallest place any of
// them renders. A stroked icon at that size loses its detail to hinting; a
// silhouette does not.
//
// COLOUR IS SET AT THE CALL SITE. Each path is fill="currentColor", so the
// icon takes the text colour of whatever wraps it:
//
//   <Package className="h-5 w-5 text-[#17131c]" />   ink, in a tint tile
//   <Package className="h-5 w-5 text-white" />       on the purple band
//
// Never hardcode a fill in this file. The whole point of the reduction pass is
// that colour decisions live where the element sits, not in the icon.
//
// SIZE IS ALSO SET AT THE CALL SITE, via className. There is no width/height
// on the svg — it inherits from the class, so h-5 w-5 gives 20px, h-6 w-6
// gives 24px, and nothing needs a second export.
//
// The path data here is portable to React Native: the `d` strings are
// identical under react-native-svg, only the JSX wrapper differs. If mobile
// needs this set, copy the geometry rather than redrawing it.

function Icon({ className, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  )
}

/* ---------------------------------------------------------------- deliver */

// A parcel with an upward arrow cut out of it. Up, not right: "send" is an
// outbound action, and the up-arrow is the one direction that does not read
// as "next" or "forward" elsewhere in the interface.
export function SendPackage({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M4 5h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm8 3.2-4.2 4.3h2.7v4h3v-4h2.7L12 8.2Z"
      />
    </Icon>
  )
}

// A carry case with a cross cut out, plus a handle. The cross is the only
// medical signifier that survives at 20px — a vial or a droplet turns to mush.
export function MedicalDelivery({ className }) {
  return (
    <Icon className={className}>
      <path d="M9 2h6v2H9z" />
      <path
        fillRule="evenodd"
        d="M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm5 4v3H8v2h3v3h2v-3h3v-2h-3V9h-2Z"
      />
    </Icon>
  )
}

// A document with three ruled lines. Deliberately not a gavel or scales:
// both collapse into an unreadable blob below about 32px, and the service is
// document transport rather than litigation.
export function LegalDocuments({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm3 5v2h8V7H8Zm0 4v2h8v-2H8Zm0 4v2h5v-2H8Z"
      />
    </Icon>
  )
}

// Two waypoints joined by an L-shaped route. Drop Batch is a trip somebody is
// already making, so the icon is the trip — not a parcel and not a vehicle,
// both of which would collide with SendPackage and RequestRide.
export function DropBatch({ className }) {
  return (
    <Icon className={className}>
      <path d="M5 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm14 12a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
      <path d="M4 11h2v3a3 3 0 0 0 3 3h6v2H9a5 5 0 0 1-5-5v-3Z" />
    </Icon>
  )
}

// A shopping bag with the handle as negative space.
export function Marketplace({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M8 6V5a4 4 0 0 1 8 0v1h3a1 1 0 0 1 1 1.1l-1.2 12.9a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 7.1A1 1 0 0 1 5 6h3Zm2 0h4V5a2 2 0 1 0-4 0v1Z"
      />
    </Icon>
  )
}

/* ------------------------------------------------------------------- move */

// Side-view car with the glasshouse and both wheels cut out. Same silhouette
// language as the vehicle picker, so a car means the same thing in both.
export function RequestRide({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M6 5h12l2 5h1v8h-2.2a3 3 0 0 1-5.6 0h-2.4a3 3 0 0 1-5.6 0H3v-8h1l2-5Zm1.4 2-1.2 3h11.6l-1.2-3H7.4ZM6 15.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm9 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z"
      />
    </Icon>
  )
}

// Flatbed with a raised boom. The boom is what separates this from a cargo
// van at small sizes — the bed alone is not enough.
export function TowTruck({ className }) {
  return (
    <Icon className={className}>
      <path d="M12 4h2v2.8l6.4 5.6-1.3 1.5L12 7.5V4Z" />
      <path
        fillRule="evenodd"
        d="M3 9h8v5h2.5l3 3H20v3h-2.2a2.8 2.8 0 0 1-5.6 0H9.8a2.8 2.8 0 0 1-5.6 0H3V9Zm3 8.2a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 0 0-2.4 0Zm8.4 0a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 0 0-2.4 0Z"
      />
    </Icon>
  )
}

// Steering wheel, three-spoke, spokes as negative space. Reads as "someone
// else is driving your car" without needing a second figure.
export function DesignatedDriver({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a7 7 0 0 1 6.9 5.8H5.1A7 7 0 0 1 12 5Zm-6.9 8.2h5.7v5.6a7 7 0 0 1-5.7-5.6Zm8.1 5.6v-5.6h5.7a7 7 0 0 1-5.7 5.6Z"
      />
    </Icon>
  )
}

// Paw. Four toes and a pad, all separate shapes — no cutouts needed.
export function PetTransport({ className }) {
  return (
    <Icon className={className}>
      <circle cx="6.5" cy="8.5" r="2.3" />
      <circle cx="10.5" cy="5.4" r="2.3" />
      <circle cx="14.5" cy="5.4" r="2.3" />
      <circle cx="18" cy="9.2" r="2.3" />
      <path d="M12.2 11.4c3 0 5.4 2.6 5.4 5.4 0 2.1-1.4 3.4-3.2 3.4-1.1 0-1.5-.4-2.2-.4s-1.1.4-2.2.4c-1.8 0-3.2-1.3-3.2-3.4 0-2.8 2.4-5.4 5.4-5.4Z" />
    </Icon>
  )
}

// A key, not a car. Rental is about custody of the vehicle, and a second car
// silhouette next to RequestRide would be indistinguishable in a grid.
export function RentCar({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M15.5 2a6.5 6.5 0 0 0-6.1 8.8L2 18.2V22h4v-2h2v-2h2l1.2-1.2A6.5 6.5 0 1 0 15.5 2Zm1.5 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
      />
    </Icon>
  )
}

/* ------------------------------------------------------------------ learn */

export function TrainingHub({ className }) {
  return (
    <Icon className={className}>
      <path d="M12 3 1 9l11 6 9-4.9V17h2V9L12 3Z" />
      <path d="M5 13.2 12 17l7-3.8V17c0 1.7-3.1 3-7 3s-7-1.3-7-3v-3.8Z" />
    </Icon>
  )
}

/* ------------------------------------------------- why druppr, home page */

// Parcel with three motion rules to its left. The rules shorten toward the
// middle so the group reads as speed rather than as a list.
export function SameDayDelivery({ className }) {
  return (
    <Icon className={className}>
      <rect x="8" y="5" width="14" height="14" rx="1.5" />
      <rect x="1" y="7" width="5" height="2" rx="1" />
      <rect x="3" y="11" width="3" height="2" rx="1" />
      <rect x="1" y="15" width="5" height="2" rx="1" />
    </Icon>
  )
}

export function LiveTracking({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
      />
    </Icon>
  )
}

// Shield with a DIAMOND cut out, not a check or a cross. TDG placards are
// diamonds — the shape is the actual regulatory signifier, so it means
// something specific to a clinic or lab manager rather than reading as a
// generic trust badge.
export function TdgCertified({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M12 2 4 5v7c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Zm0 5.5L8.8 12 12 16.5 15.2 12 12 7.5Z"
      />
    </Icon>
  )
}

export function ConfirmedDelivery({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm11.7 6.3-1.4-1.4-4.8 4.8-2.3-2.3-1.4 1.4 3.7 3.7 6.2-6.2Z"
      />
    </Icon>
  )
}

/* ---------------------------------------------------------- medical page */

// Rosette with a check. Distinct from VettedDrivers, which is a figure inside
// a shield — one is the credential, the other is the person.
export function CertifiedDriver({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M12 2 9.6 4.2 6.4 4l-.7 3.2L3 9l1.5 2.9L3 14.8l2.7 1.8.7 3.2 3.2-.2L12 22l2.4-2.2 3.2.2.7-3.2 2.7-1.8-1.5-2.9L21 9l-2.7-1.8L17.6 4l-3.2.2L12 2Zm-1.2 13.5-3.3-3.3 1.4-1.4 1.9 1.9 4.4-4.4 1.4 1.4-5.8 5.8Z"
      />
    </Icon>
  )
}

// A log: short entry markers in the left column, longer values to their
// right. Ruled lines alone would repeat LegalDocuments.
export function AuditableRecord({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 4v2h2V7H7Zm4 0v2h6V7h-6ZM7 11v2h2v-2H7Zm4 0v2h6v-2h-6Zm-4 4v2h2v-2H7Zm4 0v2h6v-2h-6Z"
      />
    </Icon>
  )
}

export function ScheduledRoutes({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V2Zm12 8H5v10h14V10Z"
      />
    </Icon>
  )
}

// Receipt with a torn bottom edge. The tear is what makes it a bill rather
// than another document.
export function MonthlyInvoicing({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M6 2h12a2 2 0 0 1 2 2v18l-4-2-4 2-4-2-4 2V4a2 2 0 0 1 2-2Zm2 5v2h8V7H8Zm0 4v2h8v-2H8Zm0 4v2h5v-2H8Z"
      />
    </Icon>
  )
}

/* ------------------------------------------------------------ legal page */

export function TimestampedTracking({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 4v5.6l3.7 2.2-1 1.7L11 12.6V6h2Z"
      />
    </Icon>
  )
}

// Padlock with a keyhole. The drop-off code is a secret the recipient holds,
// so the icon is the lock rather than a keypad — a keypad's dots vanish at
// 20px.
export function DropOffCode({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M12 2a5 5 0 0 1 5 5v2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v2h6V7a3 3 0 0 0-3-3Zm0 9.5a1.5 1.5 0 0 0-.8 2.8V18h1.6v-2.7a1.5 1.5 0 0 0-.8-2.8Z"
      />
    </Icon>
  )
}

// A figure inside a shield. Vetting is about the person having been checked,
// so the person is the subject and the shield is the frame.
export function VettedDrivers({ className }) {
  return (
    <Icon className={className}>
      <path
        fillRule="evenodd"
        d="M12 2 4 5v6.5c0 5 3.4 9.4 8 10.5 4.6-1.1 8-5.5 8-10.5V5l-8-3Zm0 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm0 6.5c2.2 0 4 1.3 4 2.8v1.2H8v-1.2c0-1.5 1.8-2.8 4-2.8Z"
      />
    </Icon>
  )
}
