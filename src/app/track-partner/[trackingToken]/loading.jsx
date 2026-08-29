export default function Loading() {
  return (
    <main className="min-h-screen bg-surface-page px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-[1320px] animate-pulse space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-8 w-24 rounded-full bg-[#eeebf1]" />
          <div className="h-4 w-28 rounded-full bg-[#eeebf1]" />
          <div className="h-6 w-48 rounded-full bg-[#eeebf1]" />
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.35fr)] lg:gap-7">
          <div className="h-80 rounded-card border border-[#eeebf1] bg-surface-raised" />
          <div className="h-[clamp(360px,46vh,560px)] rounded-card border border-[#eeebf1] bg-surface-raised lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1" />
          <div className="space-y-5 lg:col-start-1 lg:row-start-2">
            <div className="h-40 rounded-card border border-[#eeebf1] bg-surface-raised" />
            <div className="h-48 rounded-card border border-[#eeebf1] bg-surface-raised" />
            <div className="h-48 rounded-card border border-[#eeebf1] bg-surface-raised" />
            <div className="h-64 rounded-card border border-[#eeebf1] bg-surface-raised" />
          </div>
        </div>
      </div>
    </main>
  )
}
