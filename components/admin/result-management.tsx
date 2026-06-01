"use client";

import { useState } from "react";

type MatchOption = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
};

type PlayerOption = {
  id: string;
  name: string;
  teamName: string;
};

type ResultManagementProps = {
  matches: MatchOption[];
  players: PlayerOption[];
};

export function ResultManagement({ matches, players }: ResultManagementProps) {
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id ?? "");
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");
  const [scorerId, setScorerId] = useState("");
  const [minute, setMinute] = useState("");
  const [scorers, setScorers] = useState<Array<{ playerId: string; minute?: number }>>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function addScorer() {
    if (!scorerId) {
      return;
    }

    setScorers((current) => [
      ...current,
      { playerId: scorerId, minute: minute ? Number(minute) : undefined }
    ]);
    setScorerId("");
    setMinute("");
  }

  async function submitResult() {
    setIsPending(true);
    setMessage(null);

    const response = await fetch("/api/admin/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: selectedMatchId,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        goalScorers: scorers
      })
    });

    setIsPending(false);
    setMessage(response.ok ? "Result saved and scoring recalculated." : "Could not save result.");
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-xl font-semibold text-white">Results Management</h3>
      <div className="mt-4 space-y-3">
        <select
          value={selectedMatchId}
          onChange={(event) => setSelectedMatchId(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white"
        >
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.homeTeam} vs {match.awayTeam} · {match.status}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input value={homeScore} onChange={(event) => setHomeScore(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white" />
          <input value={awayScore} onChange={(event) => setAwayScore(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white" />
        </div>
        <div className="grid grid-cols-[1fr_110px_90px] gap-2">
          <select value={scorerId} onChange={(event) => setScorerId(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white">
            <option value="">Select scorer</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} · {player.teamName}
              </option>
            ))}
          </select>
          <input value={minute} onChange={(event) => setMinute(event.target.value)} placeholder="Minute" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white" />
          <button type="button" onClick={addScorer} className="rounded-2xl bg-white/10 px-4 py-3 text-white">
            Add
          </button>
        </div>
        {scorers.length ? (
          <div className="rounded-2xl bg-slate-950/60 p-3 text-sm text-slate-300">
            {scorers.map((scorer, index) => {
              const player = players.find((entry) => entry.id === scorer.playerId);
              return (
                <p key={`${scorer.playerId}-${index}`}>
                  {player?.name ?? scorer.playerId} {scorer.minute ? `(${scorer.minute}')` : ""}
                </p>
              );
            })}
          </div>
        ) : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        <button type="button" disabled={isPending} onClick={submitResult} className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950">
          {isPending ? "Saving..." : "Save result"}
        </button>
      </div>
    </div>
  );
}
