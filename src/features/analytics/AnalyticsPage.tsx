import { CompactBar } from '../../components/CompactBar';
import { MetricCard } from '../../components/MetricCard';
import { PageHeader } from '../../components/PageHeader';
import { queueMeta, queueNames } from '../../config/queues';
import type { AnalyticsSummary } from '../../lib/analytics';

export function AnalyticsPage({
  analytics,
  onBack,
}: {
  analytics: AnalyticsSummary;
  onBack: () => void;
}) {
  const maxQueueCount = Math.max(
    1,
    ...queueNames.map((queueName) => analytics.queueDistribution[queueName]),
  );
  const movementReasonEntries = Object.entries(analytics.movementReasonTotals);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Analytics" onBack={onBack} />

        <section className="grid gap-4 md:grid-cols-5">
          <MetricCard label="Open" value={analytics.openCount.toString()} />
          <MetricCard
            label="Completed"
            value={analytics.completedCount.toString()}
          />
          <MetricCard
            label="Effort"
            value={`${Math.round(analytics.queuedEffortMinutes / 60)}h ${
              analytics.queuedEffortMinutes % 60
            }m`}
          />
          <MetricCard
            label="Deferrals"
            value={analytics.deferralCount.toString()}
          />
          <MetricCard
            label="Movements"
            value={analytics.movementCount.toString()}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">
              Queue distribution
            </h2>
            <div className="mt-4 grid gap-4">
              {queueNames.map((queueName) => {
                const count = analytics.queueDistribution[queueName];

                return (
                  <CompactBar
                    key={queueName}
                    label={queueMeta[queueName].title}
                    value={count}
                    widthPercent={(count / maxQueueCount) * 100}
                  />
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">
              Scheduler behavior
            </h2>
            {analytics.movementCount === 0 ? (
              <p className="mt-4 rounded-md border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-500">
                Scheduler movement totals will appear after tasks move between
                queues.
              </p>
            ) : (
              <div className="mt-4 grid gap-4">
                {movementReasonEntries.map(([reason, count]) => (
                  <CompactBar
                    key={reason}
                    label={reason}
                    value={count}
                    widthPercent={(count / analytics.movementCount) * 100}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
