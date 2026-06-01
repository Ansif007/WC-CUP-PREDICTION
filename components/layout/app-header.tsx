import { ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";

type AppHeaderProps = {
  displayName?: string | null;
  department?: string | null;
};

export function AppHeader({ displayName, department }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 -mx-4 mb-5 border-b border-white/10 bg-[#071019]/92 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(52,211,153,0.28)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{displayName ?? "MRF Predict"}</p>
            <p className="truncate text-xs text-slate-400">{department ?? "World Cup Challenge"}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
