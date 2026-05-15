import { BarChart3, Check, Plus } from 'lucide-react';
import { BrandMark } from '../../components/BrandMark';
import { MetricCard } from '../../components/MetricCard';
import { queueNames } from '../../config/queues';
import type { ReminderSummary } from '../../lib/reminders';
import type { TaskFilter, TaskSort } from '../../lib/taskView';
import type { QueueName, ScheduleEvent, ScheduleResult, Task } from '../../types';
import { QueueColumn } from './QueueColumn';
import { SchedulerPanel } from './SchedulerPanel';

export function DashboardPage({
  scheduled,
  scheduleEvents,
  visibleQueues,
  openTasks,
  completedCount,
  totalEffort,
  reminders,
  search,
  filter,
  sort,
  backupMessage,
  onCreateTask,
  onCompleted,
  onAnalytics,
  onOpenTask,
  onComplete,
  onDefer,
  onReset,
  onExport,
  onImport,
  onSearchChange,
  onFilterChange,
  onSortChange,
}: {
  scheduled: ScheduleResult;
  scheduleEvents: ScheduleEvent[];
  visibleQueues: Record<QueueName, Task[]>;
  openTasks: Task[];
  completedCount: number;
  totalEffort: number;
  reminders: ReminderSummary;
  search: string;
  filter: TaskFilter;
  sort: TaskSort;
  backupMessage?: string;
  onCreateTask: () => void;
  onCompleted: () => void;
  onAnalytics: () => void;
  onOpenTask: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string) => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (rawValue: string) => void;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: TaskFilter) => void;
  onSortChange: (value: TaskSort) => void;
}) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <BrandMark />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCreateTask}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create task
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Open tasks" value={openTasks.length.toString()} />
          <MetricCard
            label="Queued effort"
            value={`${Math.round(totalEffort / 60)}h ${totalEffort % 60}m`}
          />
          <MetricCard
            label="Completed"
            value={completedCount.toString()}
            onClick={onCompleted}
          />
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <ReminderCard label="Overdue" count={reminders.overdue.length} tone="red" />
          <ReminderCard label="Due today" count={reminders.dueToday.length} tone="focus" />
          <ReminderCard label="Upcoming" count={reminders.upcoming.length} tone="active" />
        </section>

        <section className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCompleted}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Completed
          </button>
          <button
            type="button"
            onClick={onAnalytics}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Analytics
          </button>
        </section>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_180px]">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
            placeholder="Search tasks"
          />
          <select
            value={filter}
            onChange={(event) => onFilterChange(event.target.value as TaskFilter)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
          >
            <option value="all">All open</option>
            <option value="due-today">Due today</option>
            <option value="overdue">Overdue</option>
            <option value="snoozed">Snoozed</option>
          </select>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as TaskSort)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
          >
            <option value="scheduler">Scheduler score</option>
            <option value="deadline">Deadline</option>
            <option value="urgency">Urgency</option>
            <option value="effort">Effort</option>
          </select>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <section className="grid min-w-0 gap-4 lg:grid-cols-3">
            {queueNames.map((queueName) => (
              <QueueColumn
                key={queueName}
                queueName={queueName}
                tasks={visibleQueues[queueName]}
                onComplete={onComplete}
                onDefer={onDefer}
                onOpenTask={onOpenTask}
              />
            ))}
          </section>

          <SchedulerPanel
            events={scheduleEvents}
            tasks={scheduled.tasks}
            nextFocusTask={scheduled.queues.focus[0]}
            onReset={onReset}
            onExport={onExport}
            onImport={onImport}
            backupMessage={backupMessage}
          />
        </section>
      </section>
    </main>
  );
}

function ReminderCard({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: 'red' | 'focus' | 'active';
}) {
  const toneClass =
    tone === 'red'
      ? 'border-red-200 bg-red-50 text-red-700'
      : tone === 'focus'
        ? 'border-focus/20 bg-focus/10 text-focus'
        : 'border-active/20 bg-active/10 text-active';

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{count}</p>
    </div>
  );
}
