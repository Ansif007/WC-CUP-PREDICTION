import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { matchSchema } from "@/lib/validators";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true, result: true },
    orderBy: { kickoffAt: "asc" }
  });

  return NextResponse.json(matches);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = matchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.homeTeamId === parsed.data.awayTeamId) {
    return NextResponse.json({ error: "Teams must be different" }, { status: 400 });
  }

  const match = await prisma.match.create({
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
      action: "MATCH_CREATED",
      entityType: "Match",
      entityId: match.id,
      metadata: {
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name
      }
    }
  });

  return NextResponse.json(match, { status: 201 });
}
