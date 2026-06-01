"use client";

import { useMemo, useState } from "react";

type TeamOption = {
  id: string;
  name: string;
};

type MatchRow = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: string;
  awayTeam: string;
  stage: string;
  kickoffAt: string;
  lockAt: string;
  status: string;
  stadium: string | null;
  matchDay: number;
};

type MatchManagementProps = {
  teams: TeamOption[];
  matches: MatchRow[];
};

type MatchResponse = MatchRow & {
  homeTeam?: { name: string };
  awayTeam?: { name: string };
};

const emptyForm = {
  id: "",
  homeTeamId: "",
  awayTeamId: "",
  stage: "GROUP",
  kickoffAt: "",
  lockAt: "",
  status: "SCHEDULED",
  stadium: "",
  matchDay: "1"
};

export function MatchManagement({ teams, matches }: MatchManagementProps) {
  const [rows, setRows] = useState(matches);
  const [form, setForm] = useState(emptyForm);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const teamMap = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function editMatch(match: MatchRow) {
    setForm({
      id: match.id,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      stage: match.stage,
      kickoffAt: match.kickoffAt.slice(0, 16),
      lockAt: match.lockAt.slice(0, 16),
      status: match.status,
      stadium: match.stadium ?? "",
      matchDay: String(match.matchDay)
    });
    setMessage(null);
  }

  function resetForm() {
    setForm(emptyForm);
  }

  async function saveMatch() {
    setIsPending(true);
    setMessage(null);

    const payload = {
      homeTeamId: form.homeTeamId,
      awayTeamId: form.awayTeamId,
      stage: form.stage,
      kickoffAt: new Date(form.kickoffAt).toISOString(),
      lockAt: form.lockAt ? new Date(form.lockAt).toISOString() : undefined,
      status: form.status,
      stadium: form.stadium || null,
      matchDay: Number(form.matchDay)
    };

    const response = await fetch(form.id ? `/api/admin/matches/${form.id}` : "/api/admin/matches", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = (await response.json().catch(() => null)) as MatchResponse | { error?: string } | null;
    setIsPending(false);

    if (!response.ok || !data || "error" in data || !("id" in data)) {
      setMessage("Could not save match.");
      return;
    }

    const normalized: MatchRow = {
      id: data.id,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      homeTeam: data.homeTeam?.name ?? teamMap.get(data.homeTeamId) ?? "",
      awayTeam: data.awayTeam?.name ?? teamMap.get(data.awayTeamId) ?? "",
      stage: data.stage,
      kickoffAt: data.kickoffAt,
      lockAt: data.lockAt,
      status: data.status,
      stadium: data.stadium,
      matchDay: data.matchDay
    };

    setRows((current) => {
      const index = current.findIndex((row) => row.id === normalized.id);
      if (index >= 0) {
        const copy = [...current];
        copy[index] = normalized;
        return copy;
      }
      return [...current, normalized].sort((left, right) => left.kickoffAt.localeCompare(right.kickoffAt));
    });
    setMessage(form.id ? "Match updated." : "Match created.");
    resetForm();
  }

  async function deleteMatch(matchId: string) {
    setIsPending(true);
    setMessage(null);
    const response = await fetch(`/api/admin/matches/${matchId}`, { method: "DELETE" });
    setIsPending(false);

    if (!response.ok) {
      setMessage("Could not delete match.");
      return;
    }

    setRows((current) => current.filter((row) => row.id !== matchId));
    if (form.id === matchId) {
      resetForm();
    }
    setMessage("Match deleted.");
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-white">Match Management</h2>
        <p className="text-sm text-slate-400">Create, edit, and remove fixtures.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="grid gap-3">
            <select value={form.homeTeamId} onChange={(event) => updateField("homeTeamId", event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white">
              <option value="">Select home team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <select value={form.awayTeamId} onChange={(event) => updateField("awayTeamId", event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white">
              <option value="">Select away team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <select value={form.stage} onChange={(event) => updateField("stage", event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white">
              {["GROUP", "ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL", "FINAL"].map((stage) => (
                <option key={stage} value={stage}>{stage.replaceAll("_", " ")}</option>
              ))}
            </select>
            <input type="datetime-local" value={form.kickoffAt} onChange={(event) => updateField("kickoffAt", event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white" />
            <input type="datetime-local" value={form.lockAt} onChange={(event) => updateField("lockAt", event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white" />
            <input value={form.stadium} onChange={(event) => updateField("stadium", event.target.value)} placeholder="Stadium" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.status} onChange={(event) => updateField("status", event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white">
                {["SCHEDULED", "LIVE", "FINISHED", "POSTPONED", "CANCELLED"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input value={form.matchDay} onChange={(event) => updateField("matchDay", event.target.value)} placeholder="Match day" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={saveMatch} disabled={isPending} className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950">
                {form.id ? "Update Match" : "Create Match"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white">
                Reset
              </button>
            </div>
            {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
          </div>
        </div>
        <div className="space-y-3">
          {rows.map((match) => (
            <div key={match.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{match.homeTeam} vs {match.awayTeam}</p>
                  <p className="text-sm text-slate-400">{match.stage.replaceAll("_", " ")} · Match Day {match.matchDay}</p>
                  <p className="text-sm text-slate-500">{new Date(match.kickoffAt).toLocaleString()} · {match.stadium ?? "TBD"}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-emerald-300">{match.status}</span>
              </div>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => editMatch(match)} className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                  Edit
                </button>
                <button type="button" onClick={() => deleteMatch(match.id)} className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
