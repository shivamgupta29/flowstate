import { queueMeta } from '../../config/queues';
import type { QueueName, Task } from '../../types';
import { TaskCard } from './TaskCard';

export function QueueColumn({
  queueName,
  tasks,
  onComplete,
  onDefer,
  onOpenTask,
}: {
  queueName: QueueName;
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
}) {
  const meta = queueMeta[queueName];
  const Icon = meta.icon;

  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={`border-b p-4 ${meta.accent}`}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/80">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">{meta.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{meta.description}</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-[360px] flex-col gap-3 p-3">
        {tasks.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-md border border-dashed border-slate-300 px-4 text-center text-sm leading-6 text-slate-500">
            No open tasks in this queue.
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDefer={onDefer}
              onOpenTask={onOpenTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
