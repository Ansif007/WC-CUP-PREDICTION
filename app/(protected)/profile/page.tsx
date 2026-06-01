import { NotificationList } from "@/components/profile/notification-list";
import { requireSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: {
      department: true,
      predictions: {
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true
            }
          }
        },
        orderBy: { updatedAt: "desc" },
        take: 5
      },
      notifications: {
        orderBy: { createdAt: "desc" },
        take: 6
      }
    }
  });

  const totalPredictions = user.predictions.length;
  const winnerPercentage = totalPredictions ? Math.round((user.winnerHits / totalPredictions) * 100) : 0;
  const exactPercentage = totalPredictions ? Math.round((user.exactScoreHits / totalPredictions) * 100) : 0;
  const scorerPercentage = totalPredictions ? Math.round((user.scorerHits / totalPredictions) * 100) : 0;

  return (
    <>
      <section className="app-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Profile</p>
        <h1 className="mt-1 text-3xl font-black text-white">{user.displayName}</h1>
        <p className="text-sm text-slate-400">
          {user.department.name} - {user.employeeId}
        </p>
        <p className="mt-3 text-sm text-emerald-300">{user.fullName}</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="app-panel p-4"><p className="text-sm text-slate-400">Winner %</p><p className="mt-2 text-2xl font-black text-white">{winnerPercentage}%</p></div>
        <div className="app-panel p-4"><p className="text-sm text-slate-400">Exact Score %</p><p className="mt-2 text-2xl font-black text-white">{exactPercentage}%</p></div>
        <div className="app-panel p-4"><p className="text-sm text-slate-400">Scorer %</p><p className="mt-2 text-2xl font-black text-white">{scorerPercentage}%</p></div>
        <div className="app-panel p-4"><p className="text-sm text-slate-400">Current Streak</p><p className="mt-2 text-2xl font-black text-amber-300">{user.currentStreak}</p></div>
      </section>

      <section className="app-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Predictions</h2>
          <span className="text-sm text-slate-400">{user.totalPoints} pts</span>
        </div>
        <div className="mt-4 space-y-3">
          {user.predictions.length ? (
            user.predictions.map((prediction) => (
              <div key={prediction.id} className="rounded-lg bg-slate-950/60 p-4">
                <p className="text-sm font-medium text-white">
                  {prediction.match.homeTeam.name} vs {prediction.match.awayTeam.name}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Score {prediction.predictedHomeScore}-{prediction.predictedAwayScore} - {prediction.predictedOutcome.replaceAll("_", " ")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No predictions submitted yet.</p>
          )}
        </div>
      </section>

      <NotificationList
        notifications={user.notifications.map((item) => ({
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
