export default function Loading() {
  return (
    <main className="min-h-screen bg-surface-page px-5 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-3xl animate-pulse space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-14 w-14 rounded-full bg-[#eeebf1]" />
          <div className="h-4 w-32 rounded-full bg-[#eeebf1]" />
          <div className="h-6 w-48 rounded-full bg-[#eeebf1]" />
        </div>

        <div className="rounded-card border border-[#eeebf1] bg-surface-raised p-8 text-center shadow-card">
          <div className="mx-auto h-6 w-24 rounded-full bg-[#eeebf1]" />
          <div className="mx-auto mt-4 h-6 w-56 rounded-full bg-[#eeebf1]" />
          <div className="mx-auto mt-3 h-4 w-64 rounded-full bg-surface-tint" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-48 rounded-card border border-[#eeebf1] bg-surface-raised" />
          <div className="h-48 rounded-card border border-[#eeebf1] bg-surface-raised" />
        </div>

        <div className="mx-auto h-3 w-48 rounded-full bg-[#eeebf1]" />
      </div>
    </main>
  )
}
