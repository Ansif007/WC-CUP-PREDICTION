import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { upsertMatchResult } from "@/lib/services/scoring-engine";
import { resultSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = resultSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await upsertMatchResult({
    ...parsed.data,
    updatedById: session.user.id
  });

  return NextResponse.json({ success: true });
}
