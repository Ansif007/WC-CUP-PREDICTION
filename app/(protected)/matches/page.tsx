import { PredictionForm } from "@/components/matches/prediction-form";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const session = await requireSession();
  const matches = await prisma.match.findMany({
    include: {
      homeTeam: { include: { players: { orderBy: { name: "asc" } } } },
      awayTeam: { include: { players: { orderBy: { name: "asc" } } } },
      predictions: {
        where: { userId: session.user.id },
        take: 1
      }
    },
    orderBy: { kickoffAt: "asc" }
  });

  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Fixtures</p>
        <h1 className="mt-1 text-3xl font-black text-white">Make the call</h1>
      </div>

      {matches.map((match) => (
        <article key={match.id} className="app-card p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
            <span className="text-emerald-300">{match.stage.replaceAll("_", " ")}</span>
            <span className="rounded-full border border-white/10 px-2 py-1">{match.status}</span>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-lg font-black text-white">
            <span>{match.homeTeam.name}</span>
            <span className="rounded bg-white/10 px-2 py-1 text-xs text-slate-300">VS</span>
            <span className="text-right">{match.awayTeam.name}</span>
          </div>
          <p className="mt-3 text-sm text-slate-400">Kickoff: {new Date(match.kickoffAt).toLocaleString()}</p>
          <PredictionForm
            matchId={match.id}
            homeTeam={match.homeTeam.name}
            awayTeam={match.awayTeam.name}
            locked={new Date() >= match.lockAt}
            players={[...match.homeTeam.players, ...match.awayTeam.players].map((player) => ({
              id: player.id,
              name: player.name
            }))}
            initialPrediction={
              match.predictions[0]
                ? {
                    predictedOutcome: match.predictions[0].predictedOutcome,
                    predictedHomeScore: match.predictions[0].predictedHomeScore,
                    predictedAwayScore: match.predictions[0].predictedAwayScore,
                    predictedScorerId: match.predictions[0].predictedScorerId
                  }
                : null
            }
          />
        </article>
      ))}
    </>
  );
}
