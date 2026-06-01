"use client";

import { useState } from "react";

type Department = {
  id: string;
  name: string;
};

type RegisterFormProps = {
  departments: Department[];
};

export function RegisterForm({ departments }: RegisterFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    setSuccess(null);

    const payload = {
      employeeId: String(formData.get("employeeId") ?? ""),
      fullName: String(formData.get("fullName") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
      departmentId: String(formData.get("departmentId") ?? ""),
      pin: String(formData.get("pin") ?? "")
    };

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setIsPending(false);

    if (!response.ok) {
      setError("Registration failed. Check your details or try a different employee/display name.");
      return;
    }

    setSuccess("Registration submitted. Wait for admin approval before logging in.");
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <input
        name="employeeId"
        className="w-full rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60"
        placeholder="Employee ID"
        required
      />
      <input
        name="fullName"
        className="w-full rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60"
        placeholder="Full Name"
        required
      />
      <input
        name="displayName"
        className="w-full rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60"
        placeholder="Display Name"
        required
      />
      <select
        name="departmentId"
        className="w-full rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
        defaultValue=""
        required
      >
        <option value="">Select Department</option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>
      <input
        name="pin"
        className="w-full rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60"
        placeholder="4-digit PIN"
        type="password"
        inputMode="numeric"
        pattern="\d{4}"
        required
      />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-emerald-400 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Submitting..." : "Submit for approval"}
      </button>
    </form>
  );
}
