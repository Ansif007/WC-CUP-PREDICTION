import { NextResponse } from "next/server";
import { lockStartedPredictions, sendKickoffWarnings } from "@/lib/services/scoring-engine";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("x-cron-secret") === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [lockedCount, warningsSent] = await Promise.all([
    lockStartedPredictions(),
    sendKickoffWarnings()
  ]);

  return NextResponse.json({ success: true, lockedCount, warningsSent });
}
