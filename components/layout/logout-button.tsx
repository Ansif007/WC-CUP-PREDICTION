"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.08] text-slate-200 transition hover:bg-white/[0.14] hover:text-white"
      aria-label="Log out"
      title="Log out"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
