import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <div className="app-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">MRF Predict</p>
        <h1 className="mt-2 text-3xl font-black text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Use your Employee ID and 4-digit PIN.</p>
        <LoginForm callbackUrl={params?.callbackUrl} />
      </div>
    </main>
  );
}
