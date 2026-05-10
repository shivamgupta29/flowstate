export function CompactBar({
  label,
  value,
  widthPercent,
}: {
  label: string;
  value: number;
  widthPercent: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-ink">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-active"
          style={{ width: `${Math.max(widthPercent, value > 0 ? 8 : 0)}%` }}
        />
      </div>
    </div>
  );
}
