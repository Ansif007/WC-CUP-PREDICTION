import { MatchStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { rebuildLeaderboardSnapshots } from "@/lib/services/leaderboard";
import { notifyApprovedUsers } from "@/lib/services/notifications";
import { calculatePredictionScore, deriveOutcome } from "@/lib/services/scoring";

function computeStreak(points: number[]) {
  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;

  for (const value of points) {
    if (value > 0) {
      running += 1;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 0;
    }
  }

  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index] > 0) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

export async function recalculateMatchScores(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      result: { include: { goalScorers: true } },
      predictions: {
        include: {
          predictedScorer: true,
          user: true
        }
      }
    }
  });

  if (!match?.result) {
    throw new Error("Match result not found");
  }

  const scorerIds = new Set(match.result.goalScorers.map((goal) => goal.playerId));

  await prisma.$transaction(async (transaction) => {
    await transaction.scoringHistory.deleteMany({
      where: { matchId }
    });

    for (const prediction of match.predictions) {
      const scorerHit = prediction.predictedScorerId ? scorerIds.has(prediction.predictedScorerId) : false;
      const score = calculatePredictionScore(
        match.stage,
        prediction,
        match.result!,
        scorerHit
      );

      await transaction.scoringHistory.create({
        data: {
          userId: prediction.userId,
          matchId,
          predictionId: prediction.id,
          winnerPoints: score.winnerPoints,
          differencePts: score.differencePts,
          exactScorePts: score.exactScorePts,
          scorerPoints: score.scorerPoints,
          multiplier: score.multiplier,
          totalPoints: score.totalPoints
        }
      });

      await transaction.prediction.update({
        where: { id: prediction.id },
        data: {
          pointsAwarded: score.totalPoints,
          isLocked: true
        }
      });
    }

    const users = await transaction.user.findMany({
      include: {
        scoringHistory: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    for (const user of users) {
      const history = user.scoringHistory;
      const points = history.map((item) => item.totalPoints);
      const streak = computeStreak(points);

      await transaction.user.update({
        where: { id: user.id },
        data: {
          totalPoints: history.reduce((sum, item) => sum + item.totalPoints, 0),
          winnerHits: history.filter((item) => item.winnerPoints > 0).length,
          exactScoreHits: history.filter((item) => item.exactScorePts > 0).length,
          scorerHits: history.filter((item) => item.scorerPoints > 0).length,
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak
        }
      });
    }

    await transaction.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.FINISHED
      }
    });
  });

  await rebuildLeaderboardSnapshots();
  await notifyApprovedUsers(
    "Leaderboard updated",
    `${match.homeTeamId ? "Match scoring has been recalculated." : "Scoring updated."}`
  );
}

export async function upsertMatchResult(input: {
  matchId: string;
  homeScore: number;
  awayScore: number;
  updatedById?: string;
  isOverride?: boolean;
  goalScorers: { playerId: string; minute?: number | null }[];
  status?: MatchStatus;
}) {
  const winner = deriveOutcome(input.homeScore, input.awayScore);

  await prisma.$transaction(async (transaction) => {
    const result = await transaction.matchResult.upsert({
      where: { matchId: input.matchId },
      update: {
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        winner,
        isOverride: input.isOverride ?? true,
        updatedById: input.updatedById
      },
      create: {
        matchId: input.matchId,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        winner,
        isOverride: input.isOverride ?? true,
        updatedById: input.updatedById
      }
    });

    await transaction.goalScorer.deleteMany({
      where: { matchResultId: result.id }
    });

    if (input.goalScorers.length) {
      await transaction.goalScorer.createMany({
        data: input.goalScorers.map((goal) => ({
          matchResultId: result.id,
          playerId: goal.playerId,
          minute: goal.minute ?? null
        }))
      });
    }

    await transaction.match.update({
      where: { id: input.matchId },
      data: {
        status: input.status ?? MatchStatus.FINISHED
      }
    });
  });

  await recalculateMatchScores(input.matchId);
}

export async function lockStartedPredictions() {
  const now = new Date();

  const result = await prisma.prediction.updateMany({
    where: {
      isLocked: false,
      match: {
        lockAt: {
          lte: now
        }
      }
    },
    data: { isLocked: true }
  });

  return result.count;
}

export async function sendKickoffWarnings() {
  const now = new Date();
  const upcoming = new Date(now.getTime() + 30 * 60 * 1000);

  const matches = await prisma.match.findMany({
    where: {
      lockAt: {
        gte: now,
        lte: upcoming
      },
      status: MatchStatus.SCHEDULED
    },
    include: {
      homeTeam: true,
      awayTeam: true
    }
  });

  if (!matches.length) {
    return 0;
  }

  const users = await prisma.user.findMany({
    where: { status: "APPROVED" },
    select: { id: true }
  });

  for (const match of matches) {
    await notifyApprovedUsers(
      "Prediction closes soon",
      `${match.homeTeam.name} vs ${match.awayTeam.name} locks in under 30 minutes.`
    );
  }

  return users.length * matches.length;
}
