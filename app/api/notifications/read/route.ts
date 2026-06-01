import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

export async function PATCH() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });

  return NextResponse.json({ success: true });
}
