"use client";

import { useState } from "react";

export function AdminActions() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function refreshLeaderboards() {
    setIsPending(true);
    setMessage(null);

    const response = await fetch("/api/admin/recalculate", {
      method: "POST"
    });

    setIsPending(false);
    setMessage(response.ok ? "Leaderboards refreshed." : "Could not refresh leaderboards.");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a href="/api/admin/export" className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950">
        Export report
      </a>
      <button
        type="button"
        onClick={refreshLeaderboards}
        disabled={isPending}
        className="rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Refreshing..." : "Refresh leaderboards"}
      </button>
      {message ? <p className="self-center text-sm text-emerald-300">{message}</p> : null}
    </div>
  );
}
