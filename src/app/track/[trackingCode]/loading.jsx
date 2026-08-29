export default function Loading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6eefb_0%,#fbf9f8_38%,#fbf9f8_100%)] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px] animate-pulse space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-8 w-24 rounded-full bg-[#eeebf1]" />
          <div className="h-4 w-28 rounded-full bg-[#eeebf1]" />
          <div className="h-6 w-48 rounded-full bg-[#eeebf1]" />
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.42fr)] lg:gap-8">
          <div className="h-80 rounded-card border border-[#e2d5eb] bg-surface-raised" />
          <div className="h-[clamp(360px,50vh,560px)] rounded-card border border-[#d9c7e6] bg-[#f3eafa] lg:sticky lg:top-8 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:h-[clamp(520px,62vh,720px)]" />
          <div className="h-40 rounded-card border border-[#eeebf1] bg-surface-raised lg:col-start-1" />
          <div className="h-64 rounded-card border border-[#eeebf1] bg-surface-raised lg:col-start-1" />
        </div>
      </div>
    </main>
  )
}
