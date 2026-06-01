"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type PlayerOption = {
  id: string;
  name: string;
};

type PredictionValue = {
  predictedOutcome: "HOME_WIN" | "DRAW" | "AWAY_WIN";
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedScorerId: string | null;
};

type PredictionFormProps = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  locked: boolean;
  players: PlayerOption[];
  initialPrediction?: PredictionValue | null;
};

export function PredictionForm({
  matchId,
  homeTeam,
  awayTeam,
  locked,
  players,
  initialPrediction
}: PredictionFormProps) {
  const [outcome, setOutcome] = useState<PredictionValue["predictedOutcome"]>(
    initialPrediction?.predictedOutcome ?? "HOME_WIN"
  );
  const [homeScore, setHomeScore] = useState(String(initialPrediction?.predictedHomeScore ?? 0));
  const [awayScore, setAwayScore] = useState(String(initialPrediction?.predictedAwayScore ?? 0));
  const [scorerId, setScorerId] = useState(initialPrediction?.predictedScorerId ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit() {
    setIsPending(true);
    setMessage(null);

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        predictedOutcome: outcome,
        predictedHomeScore: Number(homeScore),
        predictedAwayScore: Number(awayScore),
        predictedScorerId: scorerId || null
      })
    });

    setIsPending(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? "Could not save prediction.");
      return;
    }

    setMessage("Prediction saved.");
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-white/10 bg-slate-950/60 p-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: homeTeam, value: "HOME_WIN" as const },
          { label: "Draw", value: "DRAW" as const },
          { label: awayTeam, value: "AWAY_WIN" as const }
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={locked || isPending}
            onClick={() => setOutcome(option.value)}
            className={`min-h-12 rounded-lg px-2 py-3 text-sm font-semibold transition ${
              outcome === option.value ? "bg-emerald-400 text-slate-950" : "bg-white/[0.07] text-white hover:bg-white/[0.12]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          value={homeScore}
          onChange={(event) => setHomeScore(event.target.value)}
          disabled={locked || isPending}
          inputMode="numeric"
          className="rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
          placeholder={`${homeTeam} score`}
        />
        <input
          value={awayScore}
          onChange={(event) => setAwayScore(event.target.value)}
          disabled={locked || isPending}
          inputMode="numeric"
          className="rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
          placeholder={`${awayTeam} score`}
        />
      </div>

      <select
        value={scorerId}
        onChange={(event) => setScorerId(event.target.value)}
        disabled={locked || isPending}
        className="w-full rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
      >
        <option value="">Select one scorer</option>
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>

      {message ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm ${message === "Prediction saved." ? "text-emerald-300" : "text-rose-300"}`}
        >
          {message}
        </motion.p>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={locked || isPending}
        className="w-full rounded-lg bg-emerald-400 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {locked ? "Predictions locked" : isPending ? "Saving..." : "Save prediction"}
      </button>
    </div>
  );
}
