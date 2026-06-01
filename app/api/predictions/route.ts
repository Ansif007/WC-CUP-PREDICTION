import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { predictionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = predictionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
    include: {
      homeTeam: { include: { players: true } },
      awayTeam: { include: { players: true } }
    }
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const now = new Date();
  if (now >= match.lockAt) {
    return NextResponse.json({ error: "Predictions are locked for this match" }, { status: 400 });
  }

  const validScorerIds = new Set([
    ...match.homeTeam.players.map((player) => player.id),
    ...match.awayTeam.players.map((player) => player.id)
  ]);

  if (parsed.data.predictedScorerId && !validScorerIds.has(parsed.data.predictedScorerId)) {
    return NextResponse.json({ error: "Selected scorer is invalid for this match" }, { status: 400 });
  }

  const prediction = await prisma.prediction.upsert({
    where: {
      userId_matchId: {
        userId: session.user.id,
        matchId: parsed.data.matchId
      }
    },
    update: {
      predictedOutcome: parsed.data.predictedOutcome,
      predictedHomeScore: parsed.data.predictedHomeScore,
      predictedAwayScore: parsed.data.predictedAwayScore,
      predictedScorerId: parsed.data.predictedScorerId ?? null,
      isLocked: false
    },
    create: {
      userId: session.user.id,
      matchId: parsed.data.matchId,
      predictedOutcome: parsed.data.predictedOutcome,
      predictedHomeScore: parsed.data.predictedHomeScore,
      predictedAwayScore: parsed.data.predictedAwayScore,
      predictedScorerId: parsed.data.predictedScorerId ?? null
    }
  });

  return NextResponse.json({ id: prediction.id }, { status: 200 });
}
