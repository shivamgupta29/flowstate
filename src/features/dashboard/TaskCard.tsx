import { Check, Clock3, RotateCcw } from 'lucide-react';
import type { Task } from '../../types';

export function TaskCard({
  task,
  onComplete,
  onDefer,
  onOpenTask,
}: {
  task: Task;
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
}) {
  const deadline = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(task.deadline));

  return (
    <article
      className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
      role="button"
      tabIndex={0}
      onClick={() => onOpenTask(task.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenTask(task.id);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-sm font-semibold leading-6 text-ink">
          {task.title}
        </h3>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700">
          {task.urgency}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span>{deadline}</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span>
            {task.estimatedEffortMinutes} min effort, ignored{' '}
            {task.ignoredCount}x
          </span>
        </div>
      </div>

      <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
        Why here: {task.movementReason}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onComplete(task.id);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-active/30 bg-active/10 px-3 text-sm font-semibold text-active transition hover:bg-active/15"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Done
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDefer(task.id);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Defer
        </button>
      </div>
    </article>
  );
}
