import { NextResponse } from "next/server";
import { UserStatus } from "@prisma/client";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

const allowedStatuses = new Set<UserStatus>(["APPROVED", "REJECTED", "DISABLED"]);

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { status?: UserStatus };
  const params = await context.params;

  if (!body.status || !allowedStatuses.has(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.userId },
    data: {
      status: body.status,
      approvedById: body.status === "APPROVED" ? session.user.id : null
    },
    include: {
      department: true
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: `USER_${body.status}`,
      entityType: "User",
      entityId: user.id,
      metadata: { employeeId: user.employeeId, displayName: user.displayName }
    }
  });

  return NextResponse.json({
    id: user.id,
    status: user.status,
    displayName: user.displayName,
    department: user.department.name
  });
}
