import { prisma } from "@/lib/db/prisma";

export async function createNotificationForUsers(userIds: string[], title: string, message: string) {
  if (!userIds.length) {
    return;
  }

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title,
      message
    }))
  });
}

export async function notifyApprovedUsers(title: string, message: string) {
  const users = await prisma.user.findMany({
    where: { status: "APPROVED" },
    select: { id: true }
  });

  await createNotificationForUsers(
    users.map((user) => user.id),
    title,
    message
  );
}
