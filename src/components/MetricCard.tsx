export function MetricCard({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  const className =
    'rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm';

  const content = (
    <>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} transition hover:border-slate-300 hover:bg-slate-50`}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
