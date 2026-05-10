import { ExternalLink, Undo2 } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import type { Task } from '../../types';

export function CompletedPage({
  completedTasks,
  onBack,
  onOpenTask,
  onRestore,
}: {
  completedTasks: Task[];
  onBack: () => void;
  onOpenTask: (taskId: string) => void;
  onRestore: (taskId: string) => void;
}) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Completed tasks" onBack={onBack} />

        {completedTasks.length === 0 ? (
          <EmptyState message="Completed tasks will appear here after you mark work done." />
        ) : (
          <section className="grid gap-3">
            {completedTasks.map((task) => (
              <article
                key={task.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    {task.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Completed task, {task.estimatedEffortMinutes} min effort
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => onOpenTask(task.id)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => onRestore(task.id)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-active/30 bg-active/10 px-3 text-sm font-semibold text-active transition hover:bg-active/15"
                  >
                    <Undo2 className="h-4 w-4" aria-hidden="true" />
                    Restore
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
