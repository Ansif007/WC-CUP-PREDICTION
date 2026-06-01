import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export async function requireSession() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireSession();

  if (session.user.role !== "ADMIN") {
    redirect("/matches");
  }

  return session;
}
