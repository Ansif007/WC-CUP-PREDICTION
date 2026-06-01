import { startOfDay, endOfDay } from "date-fns";
import { prisma } from "@/lib/db/prisma";

export async function rebuildLeaderboardSnapshots() {
  const [overallRows, departmentRows, dailyRows] = await Promise.all([
    prisma.user.findMany({
      where: { status: "APPROVED" },
      include: { department: true },
      orderBy: [{ totalPoints: "desc" }, { updatedAt: "asc" }]
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
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date())
        }
      },
      include: {
        user: {
          include: { department: true }
        }
      }
    })
  ]);

  const overallPayload = overallRows.map((user, index) => ({
    rank: index + 1,
    displayName: user.displayName,
    department: user.department.name,
    totalPoints: user.totalPoints
  }));

  const departmentPayload = departmentRows
    .map((department) => ({
      department: department.name,
      totalPoints: department.users.reduce((sum, user) => sum + user.totalPoints, 0)
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints);

  const dailyMap = new Map<
    string,
    { displayName: string; department: string; points: number }
  >();

  for (const row of dailyRows) {
    const current = dailyMap.get(row.userId);
    if (current) {
      current.points += row.totalPoints;
    } else {
      dailyMap.set(row.userId, {
        displayName: row.user.displayName,
        department: row.user.department.name,
        points: row.totalPoints
      });
    }
  }

  const dailyPayload = [...dailyMap.values()]
    .sort((left, right) => right.points - left.points)
    .map((entry, index) => ({
      rank: index + 1,
      displayName: entry.displayName,
      department: entry.department,
      totalPoints: entry.points
    }));

  await prisma.leaderboardSnapshot.createMany({
    data: [
      { scope: "OVERALL", payload: overallPayload },
      { scope: "DEPARTMENT", payload: departmentPayload },
      { scope: "DAILY", payload: dailyPayload }
    ]
  });

  return {
    overall: overallPayload,
    departments: departmentPayload,
    daily: dailyPayload
  };
}
