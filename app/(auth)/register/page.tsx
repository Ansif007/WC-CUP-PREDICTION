import { prisma } from "@/lib/db/prisma";
import { RegisterForm } from "@/components/auth/register-form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <div className="app-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Join the contest</p>
        <h1 className="mt-2 text-3xl font-black text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-400">Create your account for approval.</p>
        <RegisterForm departments={departments} />
      </div>
    </main>
  );
}
