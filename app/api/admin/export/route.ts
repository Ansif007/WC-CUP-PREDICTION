import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { status: "APPROVED" },
    include: { department: true },
    orderBy: [{ totalPoints: "desc" }, { displayName: "asc" }]
  });

  const csv = [
    ["Employee ID", "Display Name", "Full Name", "Department", "Points"].join(","),
    ...users.map((user) =>
      [user.employeeId, user.displayName, user.fullName, user.department.name, String(user.totalPoints)].join(",")
    )
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leaderboard-report.csv"'
    }
  });
}
