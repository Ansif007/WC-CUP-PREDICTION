"use client";

import Link from "next/link";
import { Trophy, CalendarDays, UserRound, House } from "lucide-react";
import { usePathname } from "next/navigation";
import { tabs } from "@/lib/constants/app";

const icons = {
  "/": House,
  "/matches": CalendarDays,
  "/leaderboard": Trophy,
  "/profile": UserRound
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-white/10 bg-[#071019]/95 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-white/[0.06] p-1">
        {tabs.map((tab) => {
          const Icon = icons[tab.href as keyof typeof icons];
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] transition ${
                isActive ? "bg-emerald-400 text-slate-950" : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
