import { NextResponse } from "next/server";
import { rebuildLeaderboardSnapshots } from "@/lib/services/leaderboard";

export async function GET() {
  const data = await rebuildLeaderboardSnapshots();
  return NextResponse.json(data);
}
