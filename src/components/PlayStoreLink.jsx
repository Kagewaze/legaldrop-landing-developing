import Link from 'next/link'
import clsx from 'clsx'

export function PlayStoreLink({ color = 'black' }) {
  return (
    <Link
      href="https://play.google.com/store/apps/details?id=com.legaldrop"
      aria-label="Download on the Play Store"
      className={clsx(
        'rounded-lg transition-colors',
        color === 'purple'
          ? 'bg-purple-800 text-white hover:bg-gray-900'
          : 'bg-purple-500 text-gray-900 hover:bg-purple-50',
      )}
    >
   <button type="button" class="flex items-center justify-center w-[10rem] text-white bg-black rounded-lg h-14">
    <div class="mr-3">
        <svg viewBox="30 336.7 120.9 129.2" width="30">
            <path fill="#FFD400"
                d="M119.2,421.2c15.3-8.4,27-14.8,28-15.3c3.2-1.7,6.5-6.2,0-9.7  c-2.1-1.1-13.4-7.3-28-15.3l-20.1,20.2L119.2,421.2z">
            </path>
            <path fill="#FF3333"
                d="M99.1,401.1l-64.2,64.7c1.5,0.2,3.2-0.2,5.2-1.3  c4.2-2.3,48.8-26.7,79.1-43.3L99.1,401.1L99.1,401.1z">
            </path>
            <path fill="#48FF48" d="M99.1,401.1l20.1-20.2c0,0-74.6-40.7-79.1-43.1  c-1.7-1-3.6-1.3-5.3-1L99.1,401.1z">
            </path>
            <path fill="#3BCCFF"
                d="M99.1,401.1l-64.3-64.3c-2.6,0.6-4.8,2.9-4.8,7.6  c0,7.5,0,107.5,0,113.8c0,4.3,1.7,7.4,4.9,7.7L99.1,401.1z">
            </path>
        </svg>
    </div>
    <div>
        <div class="text-xs">
            GET IT ON
        </div>
        <div class="-mt-1 font-sans text-sm font-semibold">
            Google Play
        </div>
    </div>
</button>
    </Link>
  )
}
