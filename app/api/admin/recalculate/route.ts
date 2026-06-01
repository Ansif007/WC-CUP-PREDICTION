import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { rebuildLeaderboardSnapshots } from "@/lib/services/leaderboard";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snapshots = await rebuildLeaderboardSnapshots();
  return NextResponse.json(snapshots);
}
