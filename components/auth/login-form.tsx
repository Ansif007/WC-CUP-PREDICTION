"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type LoginFormProps = {
  callbackUrl?: string;
};

export function LoginForm({ callbackUrl = "/matches" }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const employeeId = String(formData.get("employeeId") ?? "");
    const pin = String(formData.get("pin") ?? "");

    const result = await signIn("credentials", {
      employeeId,
      pin,
      redirect: false,
      callbackUrl
    });

    setIsPending(false);

    if (!result || result.error) {
      setError("Invalid credentials or account not yet approved.");
      return;
    }

    window.location.href = result.url ?? callbackUrl;
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <input
        name="employeeId"
        className="w-full rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60"
        placeholder="Employee ID"
        autoComplete="username"
        required
      />
      <input
        name="pin"
        className="w-full rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60"
        placeholder="4-digit PIN"
        type="password"
        inputMode="numeric"
        pattern="\d{4}"
        autoComplete="current-password"
        required
      />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-emerald-400 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
