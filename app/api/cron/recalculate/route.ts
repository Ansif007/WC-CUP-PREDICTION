import { NextResponse } from "next/server";
import { rebuildLeaderboardSnapshots } from "@/lib/services/leaderboard";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("x-cron-secret") === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshots = await rebuildLeaderboardSnapshots();
  return NextResponse.json({ success: true, snapshots });
}
