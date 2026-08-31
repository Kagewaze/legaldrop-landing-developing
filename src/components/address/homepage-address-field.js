// Shared visual contract for the Druppr-owned homepage address field.
// Keep this presentation-only: prediction, selection and coordinate authority
// remain with each consumer's existing logic.
export const HOMEPAGE_ADDRESS_FIELD_BASE =
  'w-full rounded-control border-[1.5px] bg-white px-4 py-3 text-base text-[#17131c] placeholder:text-[#5f5868] transition-colors focus:outline-none focus:ring-0'

export function homepageAddressBorderClass(selected) {
  return selected
    ? 'border-brand-600'
    : 'border-[#e3dfe8] focus:border-brand-600'
}

export const HOMEPAGE_ADDRESS_LABEL =
  'mb-1 block text-sm font-semibold text-[#17131c] sm:mb-1.5'

export const HOMEPAGE_ADDRESS_LIST =
  'absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-control border-[1.5px] border-[#e3dfe8] bg-white py-1 shadow-lift'
