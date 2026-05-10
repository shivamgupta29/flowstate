import { ChangeEvent } from 'react';
import { Download, History, ListRestart, Sparkles, Upload } from 'lucide-react';
import type { ScheduleEvent, Task } from '../../types';
import { MovementEventItem } from './MovementEventItem';

export function SchedulerPanel({
  events,
  tasks,
  nextFocusTask,
  onReset,
  onExport,
  onImport,
  backupMessage,
}: {
  events: ScheduleEvent[];
  tasks: Task[];
  nextFocusTask?: Task;
  onReset: () => void;
  onExport: () => void;
  onImport: (rawValue: string) => void;
  backupMessage?: string;
}) {
  const tasksById = new Map(tasks.map((task) => [task.id, task]));

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      onImport(String(reader.result ?? ''));
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  return (
    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-200 pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-active/10 text-active">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">Scheduler</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Current queue decisions from FlowState.
          </p>
        </div>
      </div>

      <section className="border-b border-slate-200 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Next focus
        </p>
        {nextFocusTask ? (
          <div className="mt-3 rounded-md border border-focus/20 bg-focus/10 p-3">
            <p className="text-sm font-semibold leading-6 text-ink">
              {nextFocusTask.title}
            </p>
            <p className="mt-2 text-xs font-medium text-focus">
              {nextFocusTask.movementReason}
            </p>
          </div>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-slate-300 p-3 text-sm leading-6 text-slate-500">
            No task is currently in Focus Queue.
          </p>
        )}
      </section>

      <section className="border-b border-slate-200 py-4">
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Recent movement
          </p>
        </div>

        {events.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm leading-6 text-slate-500">
            Queue movement will appear here after tasks are promoted, demoted,
            or boosted.
          </p>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 6).map((event) => (
              <MovementEventItem
                key={`${event.taskId}-${event.previousQueue}-${event.nextQueue}-${event.reason}-${event.timestamp}`}
                event={event}
                taskTitle={tasksById.get(event.taskId)?.title ?? 'Task'}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-3 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </button>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import
            <input
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              className="sr-only"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
        >
          <ListRestart className="h-4 w-4" aria-hidden="true" />
          Reset sample data
        </button>
        {backupMessage ? (
          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
            {backupMessage}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
