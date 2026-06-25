export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto w-full max-w-3xl animate-pulse space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-14 w-14 rounded-full bg-slate-200" />
          <div className="h-4 w-32 rounded-full bg-slate-200" />
          <div className="h-6 w-48 rounded-full bg-slate-200" />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-3/4 rounded-full bg-slate-200" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="h-16 rounded-2xl bg-slate-100" />
            <div className="h-16 rounded-2xl bg-slate-100" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-48 rounded-3xl border border-slate-200 bg-white" />
          <div className="h-48 rounded-3xl border border-slate-200 bg-white" />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-4 w-20 rounded-full bg-slate-200" />
          <div className="mx-auto mt-4 h-10 w-40 rounded-full bg-slate-200" />
          <div className="mx-auto mt-6 h-12 w-full rounded-full bg-emerald-200" />
        </div>

        <div className="mx-auto h-3 w-48 rounded-full bg-slate-200" />
      </div>
    </main>
  )
}
