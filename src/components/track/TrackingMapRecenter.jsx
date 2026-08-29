export function TrackingMapRecenter({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Recenter map on driver"
      title="Recenter on driver"
      className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd7e3] bg-white text-brand-700 shadow-lg transition hover:bg-surface-tint focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        <circle cx="12" cy="12" r="7" />
      </svg>
    </button>
  )
}
