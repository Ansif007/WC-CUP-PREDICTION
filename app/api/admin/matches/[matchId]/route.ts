import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { matchSchema } from "@/lib/validators";

export async function PATCH(request: Request, context: { params: Promise<{ matchId: string }> }) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = matchSchema.safeParse(body);
  const { matchId } = await context.params;

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.homeTeamId === parsed.data.awayTeamId) {
    return NextResponse.json({ error: "Teams must be different" }, { status: 400 });
  }

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      homeTeamId: parsed.data.homeTeamId,
      awayTeamId: parsed.data.awayTeamId,
      stage: parsed.data.stage,
      kickoffAt: new Date(parsed.data.kickoffAt),
      lockAt: parsed.data.lockAt ? new Date(parsed.data.lockAt) : new Date(parsed.data.kickoffAt),
      stadium: parsed.data.stadium ?? null,
      status: parsed.data.status,
      matchDay: parsed.data.matchDay
    },
    include: {
      homeTeam: true,
      awayTeam: true
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "MATCH_UPDATED",
      entityType: "Match",
      entityId: match.id,
      metadata: {
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name
      }
    }
  });

  return NextResponse.json(match);
}

export async function DELETE(_request: Request, context: { params: Promise<{ matchId: string }> }) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { matchId } = await context.params;

  await prisma.$transaction(async (transaction) => {
    await transaction.goalScorer.deleteMany({
      where: {
        matchResult: {
          matchId
        }
      }
    });
    await transaction.matchResult.deleteMany({ where: { matchId } });
    await transaction.scoringHistory.deleteMany({ where: { matchId } });
    await transaction.prediction.deleteMany({ where: { matchId } });
    await transaction.match.delete({ where: { id: matchId } });
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "MATCH_DELETED",
      entityType: "Match",
      entityId: matchId
    }
  });

  return NextResponse.json({ success: true });
}
