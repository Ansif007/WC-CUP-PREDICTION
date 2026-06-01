import type { Route } from "next";

export const stageMultipliers = {
  GROUP: 1,
  ROUND_OF_16: 1.5,
  QUARTERFINAL: 2,
  SEMIFINAL: 3,
  FINAL: 5
} as const;

export const tabs = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" }
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;
