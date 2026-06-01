import { requireAdmin } from "@/lib/auth/guards";
import { AdminActions } from "@/components/admin/admin-actions";
import { AnalyticsOverview } from "@/components/admin/analytics-overview";
import { MatchManagement } from "@/components/admin/match-management";
import { ResultManagement } from "@/components/admin/result-management";
import { UserManagement } from "@/components/admin/user-management";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    include: { department: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });
  const [matches, players, predictions, departments, teams] = await Promise.all([
    prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true },
      orderBy: { kickoffAt: "asc" }
    }),
    prisma.player.findMany({
      include: { team: true },
      orderBy: { name: "asc" }
    }),
    prisma.prediction.findMany({
      include: { predictedScorer: true, match: { include: { homeTeam: true, awayTeam: true } } }
    }),
    prisma.department.findMany({
      include: { users: true }
    }),
    prisma.team.findMany({
      orderBy: { name: "asc" }
    })
  ]);

  const winnerCounts = new Map<string, number>();
  const scorerCounts = new Map<string, number>();
  for (const prediction of predictions) {
    const winnerLabel =
      prediction.predictedOutcome === "HOME_WIN"
        ? prediction.match.homeTeam.name
        : prediction.predictedOutcome === "AWAY_WIN"
          ? prediction.match.awayTeam.name
          : "Draw";
    winnerCounts.set(winnerLabel, (winnerCounts.get(winnerLabel) ?? 0) + 1);

    if (prediction.predictedScorer) {
      scorerCounts.set(
        prediction.predictedScorer.name,
        (scorerCounts.get(prediction.predictedScorer.name) ?? 0) + 1
      );
    }
  }

  const mostPickedWinner = [...winnerCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const mostPickedScorer = [...scorerCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const participationByDepartment = departments.map((department) => ({
    label: department.name,
    count: department.users.length
  }));

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      <nav className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Analytics", href: "#analytics" },
          { label: "Matches", href: "#matches" },
          { label: "Results", href: "#results" },
          { label: "Users", href: "#users" }
        ].map((item) => (
          <a key={item.href} href={item.href} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-base font-semibold text-white transition hover:bg-white/10">
            {item.label}
          </a>
        ))}
      </nav>
      <AdminActions />
      <section id="analytics" className="scroll-mt-6">
        <AnalyticsOverview
          mostPickedWinner={mostPickedWinner}
          mostPickedScorer={mostPickedScorer}
          participationByDepartment={participationByDepartment}
        />
      </section>
      <section id="matches" className="scroll-mt-6">
        <MatchManagement
          teams={teams.map((team) => ({
            id: team.id,
            name: team.name
          }))}
          matches={matches.map((match) => ({
            id: match.id,
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            stage: match.stage,
            kickoffAt: match.kickoffAt.toISOString(),
            lockAt: match.lockAt.toISOString(),
            status: match.status,
            stadium: match.stadium,
            matchDay: match.matchDay
          }))}
        />
      </section>
      <section id="results" className="scroll-mt-6">
        <ResultManagement
          matches={matches.map((match) => ({
            id: match.id,
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            status: match.status
          }))}
          players={players.map((player) => ({
            id: player.id,
            name: player.name,
            teamName: player.team.name
          }))}
        />
      </section>
      <section id="users" className="space-y-4 scroll-mt-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">User Management</h2>
          <p className="text-sm text-slate-400">Approve, reject, and disable participant accounts.</p>
        </div>
        <UserManagement
          users={users.map((user) => ({
            id: user.id,
            employeeId: user.employeeId,
            fullName: user.fullName,
            displayName: user.displayName,
            status: user.status,
            department: user.department.name
          }))}
        />
      </section>
    </main>
  );
}
