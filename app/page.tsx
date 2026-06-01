import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-10">
      <section className="space-y-8 pt-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-400 text-xl font-black text-slate-950 shadow-[0_0_40px_rgba(52,211,153,0.32)]">
          MRF
        </div>
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">World Cup Prediction Challenge</p>
          <h1 className="text-4xl font-black text-white">Predict the score. Own the table.</h1>
          <p className="text-sm leading-6 text-slate-300">
            A mobile-first matchday app for predictions, scorer picks, live scoring, and department bragging rights.
          </p>
        </div>
      </section>

      <section className="grid gap-3">
        <Link href="/login" className="rounded-lg bg-emerald-400 px-5 py-4 text-center font-bold text-slate-950">Login</Link>
        <Link href="/register" className="rounded-lg border border-white/10 bg-white/[0.07] px-5 py-4 text-center font-semibold text-white">Register</Link>
      </section>
    </main>
  );
}
