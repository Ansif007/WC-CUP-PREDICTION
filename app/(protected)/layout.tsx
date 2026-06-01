import { BottomNav } from "@/components/layout/bottom-nav";
import { AppHeader } from "@/components/layout/app-header";
import { requireSession } from "@/lib/auth/guards";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28">
      <AppHeader displayName={session.user.name} department={session.user.department} />
      <div className="space-y-5">{children}</div>
      <BottomNav />
    </main>
  );
}
