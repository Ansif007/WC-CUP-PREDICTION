import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const [overallRows, departmentRows, dailyRows] = await Promise.all([
    prisma.user.findMany({
      where: { status: "APPROVED" },
      include: { department: true },
      orderBy: [{ totalPoints: "desc" }, { updatedAt: "asc" }],
      take: 10
    }),
    prisma.department.findMany({
      include: {
        users: {
          where: { status: "APPROVED" },
          select: { totalPoints: true }
        }
      }
    }),
    prisma.scoringHistory.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      include: {
        user: {
          include: { department: true }
        }
      }
    })
  ]);

  const dailyMap = new Map<string, { name: string; department: string; points: number }>();
  for (const row of dailyRows) {
    const current = dailyMap.get(row.userId);
    if (current) {
      current.points += row.totalPoints;
    } else {
      dailyMap.set(row.userId, {
        name: row.user.displayName,
        department: row.user.department.name,
        points: row.totalPoints
      });
    }
  }

  const dailyLeaders = [...dailyMap.values()].sort((a, b) => b.points - a.points).slice(0, 5);
  const departments = departmentRows
    .map((department) => ({
      department: department.name,
      points: department.users.reduce((sum, user) => sum + user.totalPoints, 0)
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Standings</p>
        <h1 className="mt-1 text-3xl font-black text-white">Leaderboard</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Overall</h2>
        {overallRows.map((row, index) => (
          <div key={row.id} className="app-card flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-black text-amber-300">#{index + 1}</p>
              <p className="text-lg font-semibold text-white">{row.displayName}</p>
              <p className="text-sm text-slate-400">{row.department.name}</p>
            </div>
            <p className="text-2xl font-black text-emerald-300">{row.totalPoints}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Daily Leaders</h2>
        {dailyLeaders.length ? (
          dailyLeaders.map((row, index) => (
            <div key={`${row.name}-${index}`} className="app-panel flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-black text-amber-300">#{index + 1}</p>
                <p className="text-lg font-semibold text-white">{row.name}</p>
                <p className="text-sm text-slate-400">{row.department}</p>
              </div>
              <p className="text-2xl font-black text-emerald-300">{row.points}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No scoring updates yet today.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Departments</h2>
        {departments.map((row, index) => (
          <div key={row.department} className="app-panel flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-black text-amber-300">#{index + 1}</p>
              <p className="text-lg font-semibold text-white">{row.department}</p>
            </div>
            <p className="text-2xl font-black text-emerald-300">{row.points}</p>
          </div>
        ))}
      </section>
    </>
  );
}
