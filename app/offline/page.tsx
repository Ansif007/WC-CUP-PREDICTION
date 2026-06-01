import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <section className="space-y-5">
        <div className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
          Offline mode
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">You are offline</h1>
          <p className="text-sm leading-6 text-slate-300">
            The app shell is available. Reconnect to load live matches, predictions, and leaderboard updates.
          </p>
        </div>
        <Link href="/matches" className="inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950">
          Back to matches
        </Link>
      </section>
    </main>
  );
}
