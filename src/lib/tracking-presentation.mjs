const STATUS_PRESENTATION = {
  pending: {
    label: 'Pending',
    headline: 'Delivery booked',
    instruction: 'We’re preparing your delivery.',
  },
  assigned: {
    label: 'Assigned',
    headline: 'Driver assigned',
    instruction: 'A driver has been assigned to your delivery.',
  },
  ongoing: {
    label: 'In progress',
    headline: 'Delivery in progress',
    instruction: 'Your delivery is in progress.',
  },
  awaiting_seller_confirmation: {
    label: 'Awaiting confirmation',
    headline: 'Waiting for seller confirmation',
    instruction: 'The seller needs to confirm this delivery request.',
  },
  awaiting_handoff: {
    label: 'Handoff in progress',
    headline: 'Delivery handoff in progress',
    instruction: 'A delivery handoff is being coordinated.',
  },
  delivered: {
    label: 'Delivered',
    headline: 'Delivery completed',
    instruction: 'Your delivery has been completed.',
  },
  cancelled: {
    label: 'Cancelled',
    headline: 'Delivery cancelled',
    instruction: 'This delivery has been cancelled.',
  },
  failed: {
    label: 'Failed',
    headline: 'Delivery could not be completed',
    instruction: 'This delivery could not be completed.',
  },
  refunded: {
    label: 'Refunded',
    headline: 'Delivery refunded',
    instruction: 'This delivery has been refunded.',
  },
}

export const TRACKING_PROGRESS_STEPS = [
  { status: 'pending', label: 'Booked' },
  { status: 'assigned', label: 'Assigned' },
  { status: 'ongoing', label: 'In progress' },
  { status: 'delivered', label: 'Delivered' },
]

const NORMAL_PROGRESS_INDEX = new Map(
  TRACKING_PROGRESS_STEPS.map((step, index) => [step.status, index]),
)
const EXCEPTIONAL_STATUSES = new Set([
  'awaiting_seller_confirmation',
  'awaiting_handoff',
])
const NEGATIVE_STATUSES = new Set(['cancelled', 'failed', 'refunded'])

function nonEmptyText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function titleCaseStatus(value) {
  const text = nonEmptyText(value)
  if (!text) return 'Status unavailable'

  return text
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getTrackingProgress(status) {
  if (NEGATIVE_STATUSES.has(status)) {
    return {
      kind: 'negative',
      label: STATUS_PRESENTATION[status].headline,
      currentIndex: -1,
    }
  }

  if (EXCEPTIONAL_STATUSES.has(status)) {
    return {
      kind: 'exceptional',
      label: STATUS_PRESENTATION[status].headline,
      currentIndex: -1,
    }
  }

  const currentIndex = NORMAL_PROGRESS_INDEX.get(status)
  if (currentIndex === undefined) {
    return { kind: 'unknown', label: 'Progress unavailable', currentIndex: -1 }
  }

  return { kind: 'normal', label: null, currentIndex }
}

export function getTrackingStatusPresentation({ status, message } = {}) {
  const known = STATUS_PRESENTATION[status]
  const backendHeader = nonEmptyText(message?.header)
  const backendDescription = nonEmptyText(message?.description)

  return {
    statusLabel: known?.label ?? titleCaseStatus(status),
    headline: backendHeader ?? known?.headline ?? 'Order status',
    instruction:
      backendDescription ??
      known?.instruction ??
      'We’ll keep this page updated as your order progresses.',
    progress: getTrackingProgress(status),
  }
}

export function formatTrackingEta(eta) {
  const duration = nonEmptyText(eta?.durationText)
  const distance = nonEmptyText(eta?.distanceText)
  const parts = []

  if (duration) parts.push(`${duration} away`)
  if (distance) parts.push(distance)

  return parts.join(' · ')
}

export function getDriverPresentation(driver) {
  if (!driver) return null

  const firstName = nonEmptyText(driver.firstName)
  const photoUrl = nonEmptyText(driver.photoUrl)
  const vehicleType = nonEmptyText(driver.vehicleType)
  const rating = Number(driver.rating)
  const hasRating = Number.isFinite(rating) && rating > 0

  return {
    name: firstName ?? 'Your driver',
    initial: firstName?.charAt(0).toUpperCase() ?? 'D',
    photoUrl,
    vehicleLabel: vehicleType ? titleCaseStatus(vehicleType) : null,
    ratingLabel: hasRating ? rating.toFixed(1) : null,
  }
}

export function getTrackingFooter(status) {
  if (status === 'delivered') {
    return 'This delivery is complete — no further updates.'
  }
  if (status === 'cancelled') {
    return 'This delivery was cancelled — live updates have ended.'
  }
  if (status === 'failed') {
    return 'This delivery could not be completed — live updates have ended.'
  }
  if (status === 'refunded') {
    return 'This delivery was refunded — live updates have ended.'
  }
  return 'This page updates automatically as your driver moves.'
}
