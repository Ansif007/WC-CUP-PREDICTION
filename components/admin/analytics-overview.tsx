type AnalyticsOverviewProps = {
  mostPickedWinner: { label: string; count: number }[];
  mostPickedScorer: { label: string; count: number }[];
  participationByDepartment: { label: string; count: number }[];
};

function AnalyticsCard({
  title,
  rows
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-2xl bg-slate-950/60 px-4 py-3">
            <span className="text-sm text-slate-300">{row.label}</span>
            <span className="text-sm font-semibold text-emerald-300">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsOverview({
  mostPickedWinner,
  mostPickedScorer,
  participationByDepartment
}: AnalyticsOverviewProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <AnalyticsCard title="Most Picked Winner" rows={mostPickedWinner} />
      <AnalyticsCard title="Most Picked Scorer" rows={mostPickedScorer} />
      <AnalyticsCard title="Department Participation" rows={participationByDepartment} />
    </div>
  );
}
