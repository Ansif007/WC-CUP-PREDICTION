import { NotificationList } from "@/components/profile/notification-list";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await requireSession();

  const todayMatches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoffAt: "asc" },
    take: 3
  });

  const [recentResults, notifications, leaderboardUsers] = await Promise.all([
    prisma.match.findMany({
      where: { status: "FINISHED", result: { isNot: null } },
      include: { homeTeam: true, awayTeam: true, result: true },
      orderBy: { updatedAt: "desc" },
      take: 3
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4
    }),
    prisma.user.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ totalPoints: "desc" }, { updatedAt: "asc" }],
      select: {
        id: true,
        totalPoints: true,
        department: { select: { name: true } }
      }
    })
  ]);

  const currentUserIndex = leaderboardUsers.findIndex((user) => user.id === session.user.id);
  const currentUser = leaderboardUsers[currentUserIndex];
  const departmentUsers = leaderboardUsers.filter((user) => user.department.name === session.user.department);
  const departmentRank = departmentUsers.findIndex((user) => user.id === session.user.id) + 1;
  const nextMatch = todayMatches[0];

  return (
    <>
      <section className="app-card overflow-hidden">
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.28),rgba(250,204,21,0.12)_55%,rgba(15,23,42,0.2))] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Matchday Command Center</p>
          <h1 className="mt-2 text-3xl font-black text-white">{session.user.name}</h1>
          <p className="mt-1 text-sm text-slate-300">
            {nextMatch ? `Next up: ${nextMatch.homeTeam.name} vs ${nextMatch.awayTeam.name}` : "No upcoming fixtures yet"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/10 text-sm">
          <div className="bg-[#0b1420]/95 p-4">
            <p className="text-slate-400">Overall</p>
            <p className="mt-1 text-2xl font-black text-white">#{currentUserIndex >= 0 ? currentUserIndex + 1 : "-"}</p>
          </div>
          <div className="bg-[#0b1420]/95 p-4">
            <p className="text-slate-400">Points</p>
            <p className="mt-1 text-2xl font-black text-amber-300">{currentUser?.totalPoints ?? 0}</p>
          </div>
          <div className="bg-[#0b1420]/95 p-4">
            <p className="text-slate-400">Department</p>
            <p className="mt-1 text-base font-semibold text-white">{session.user.department}</p>
          </div>
          <div className="bg-[#0b1420]/95 p-4">
            <p className="text-slate-400">Dept Rank</p>
            <p className="mt-1 text-2xl font-black text-emerald-300">#{departmentRank || "-"}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">Today&apos;s Matches</h2>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold text-amber-200">
            Lock at kickoff
          </span>
        </div>
        {todayMatches.map((match) => (
          <div key={match.id} className="app-panel p-4">
            <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">{match.stage.replaceAll("_", " ")}</span>
              <span className="text-right">{new Date(match.kickoffAt).toLocaleString()}</span>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-base font-bold text-white">
              <span>{match.homeTeam.name}</span>
              <span className="rounded bg-white/10 px-2 py-1 text-xs text-slate-300">VS</span>
              <span className="text-right">{match.awayTeam.name}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">Recent Results</h2>
        {recentResults.length ? (
          recentResults.map((match) => (
            <div key={match.id} className="app-panel p-4">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-white">
                <span>{match.homeTeam.name}</span>
                <span className="rounded bg-emerald-400 px-3 py-1 font-black text-slate-950">
                  {match.result?.homeScore} - {match.result?.awayScore}
                </span>
                <span className="text-right">{match.awayTeam.name}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No finished matches yet.</p>
        )}
      </section>

      <NotificationList
        notifications={notifications.map((item) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          readAt: item.readAt ? item.readAt.toISOString() : null,
          createdAt: item.createdAt.toISOString()
        }))}
      />
    </>
  );
}
