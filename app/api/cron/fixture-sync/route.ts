import { NextResponse } from "next/server";
import { MatchStage, MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { fetchFixturesFromProvider } from "@/lib/services/football-api";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("x-cron-secret") === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fixtures = await fetchFixturesFromProvider();

  for (const fixture of fixtures) {
    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findFirst({ where: { name: fixture.homeTeam } }),
      prisma.team.findFirst({ where: { name: fixture.awayTeam } })
    ]);

    if (!homeTeam || !awayTeam) {
      continue;
    }

    await prisma.match.upsert({
      where: { externalId: fixture.externalId },
      update: {
        kickoffAt: new Date(fixture.kickoffAt),
        lockAt: new Date(fixture.kickoffAt),
        stage: fixture.stage as MatchStage,
        stadium: fixture.stadium,
        status: MatchStatus.SCHEDULED,
        matchDay: fixture.matchDay ?? 1
      },
      create: {
        externalId: fixture.externalId,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        kickoffAt: new Date(fixture.kickoffAt),
        lockAt: new Date(fixture.kickoffAt),
        stage: fixture.stage as MatchStage,
        stadium: fixture.stadium,
        status: MatchStatus.SCHEDULED,
        matchDay: fixture.matchDay ?? 1
      }
    });
  }

  return NextResponse.json({ success: true, synced: fixtures.length });
}
