import {
  Activity,
  Archive,
  ArrowLeft,
  Check,
  Clock3,
  Flame,
  ListRestart,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { scheduleTasks } from './lib/scheduler';
import { seedTasks } from './lib/seedTasks';
import { clearTasks, loadTasks, saveTasks } from './lib/storage';
import type { QueueName, Task, Urgency } from './types';

const queueMeta: Record<
  QueueName,
  {
    title: string;
    description: string;
    icon: typeof Flame;
    accent: string;
  }
> = {
  focus: {
    title: 'Focus Queue',
    description: 'Deadline pressure and high-priority work.',
    icon: Flame,
    accent: 'border-focus/60 bg-focus/10 text-focus',
  },
  active: {
    title: 'Active Queue',
    description: 'Relevant tasks that should stay in rotation.',
    icon: Activity,
    accent: 'border-active/60 bg-active/10 text-active',
  },
  backlog: {
    title: 'Backlog Queue',
    description: 'Lower-pressure work that still needs visibility.',
    icon: Archive,
    accent: 'border-backlog/60 bg-backlog/10 text-backlog',
  },
};

const queueNames: QueueName[] = ['focus', 'active', 'backlog'];

const defaultForm = {
  title: '',
  deadline: '',
  urgency: 'medium' as Urgency,
  estimatedEffortMinutes: 45,
};

export function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [path, setPath] = useState(() => window.location.pathname);

  const scheduled = useMemo(() => scheduleTasks(tasks), [tasks]);
  const openTasks = scheduled.tasks.filter((task) => task.status === 'open');
  const completedCount = scheduled.tasks.length - openTasks.length;
  const totalEffort = openTasks.reduce(
    (total, task) => total + task.estimatedEffortMinutes,
    0,
  );

  useEffect(() => {
    saveTasks(scheduled.tasks);
  }, [scheduled.tasks]);

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  }

  function createTask(form: typeof defaultForm) {
    const timestamp = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      deadline: new Date(form.deadline).toISOString(),
      urgency: form.urgency,
      estimatedEffortMinutes: form.estimatedEffortMinutes,
      status: 'open',
      queue: form.urgency === 'high' ? 'active' : 'backlog',
      createdAt: timestamp,
      updatedAt: timestamp,
      ignoredCount: 0,
      lastInteractionAt: timestamp,
      movementReason: 'Stable priority',
    };

    setTasks((currentTasks) => [...currentTasks, task]);
    navigate('/');
  }

  function updateTask(taskId: string, update: (task: Task) => Task) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? update(task) : task)),
    );
  }

  function completeTask(taskId: string) {
    updateTask(taskId, (task) => ({
      ...task,
      status: 'completed',
      updatedAt: new Date().toISOString(),
      lastInteractionAt: new Date().toISOString(),
    }));
  }

  function deferTask(taskId: string) {
    updateTask(taskId, (task) => ({
      ...task,
      ignoredCount: task.ignoredCount + 1,
      updatedAt: new Date().toISOString(),
      lastInteractionAt: new Date().toISOString(),
    }));
  }

  function resetTasks() {
    clearTasks();
    setTasks(seedTasks);
  }

  if (path === '/tasks/new') {
    return <NewTaskPage onCreate={createTask} onBack={() => navigate('/')} />;
  }

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
              onClick={() => navigate('/tasks/new')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create task
            </button>
            <button
              type="button"
              onClick={resetTasks}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              <ListRestart className="h-4 w-4" aria-hidden="true" />
              Reset sample data
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Open tasks" value={openTasks.length.toString()} />
          <MetricCard
            label="Queued effort"
            value={`${Math.round(totalEffort / 60)}h ${totalEffort % 60}m`}
          />
          <MetricCard label="Completed" value={completedCount.toString()} />
        </section>

        <section className="grid min-w-0 gap-4 xl:grid-cols-3">
          {queueNames.map((queueName) => (
            <QueueColumn
              key={queueName}
              queueName={queueName}
              tasks={scheduled.queues[queueName]}
              onComplete={completeTask}
              onDefer={deferTask}
            />
          ))}
        </section>
      </section>
    </main>
  );
}

function NewTaskPage({
  onCreate,
  onBack,
}: {
  onCreate: (form: typeof defaultForm) => void;
  onBack: () => void;
}) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-slate-200 pb-6">
          <button
            type="button"
            onClick={onBack}
            className="mb-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </button>
          <BrandMark />
          <h1 className="text-2xl font-semibold tracking-normal text-ink mt-2">
            Add work to FlowState.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            FlowState uses this data to place the task in the right queue by understanding about the task.
          </p>
        </header>

        <TaskForm onCreate={onCreate} />
      </section>
    </main>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div>
        <p className="text-3xl font-bold tracking-normal text-ink text-green-400">FlowState</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function TaskForm({
  onCreate,
}: {
  onCreate: (form: typeof defaultForm) => void;
}) {
  const [form, setForm] = useState(defaultForm);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.deadline) {
      return;
    }

    onCreate(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink">Create task</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Add new data and also set the priority of the task.
        </p>
      </div>

      <label className="block text-sm font-medium text-slate-700" htmlFor="title">
        Task
      </label>
      <input
        id="title"
        value={form.title}
        onChange={(event) => setForm({ ...form, title: event.target.value })}
        className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
        placeholder="Prepare for exams."
      />

      <label
        className="mt-4 block text-sm font-medium text-slate-700"
        htmlFor="deadline"
      >
        Deadline
      </label>
      <input
        id="deadline"
        type="datetime-local"
        value={form.deadline}
        onChange={(event) => setForm({ ...form, deadline: event.target.value })}
        className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="urgency"
          >
            Urgency
          </label>
          <select
            id="urgency"
            value={form.urgency}
            onChange={(event) =>
              setForm({ ...form, urgency: event.target.value as Urgency })
            }
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="effort"
          >
            Effort
          </label>
          <input
            id="effort"
            type="number"
            min="15"
            step="15"
            value={form.estimatedEffortMinutes}
            onChange={(event) =>
              setForm({
                ...form,
                estimatedEffortMinutes: Number(event.target.value),
              })
            }
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add to scheduler
      </button>
    </form>
  );
}

function QueueColumn({
  queueName,
  tasks,
  onComplete,
  onDefer,
}: {
  queueName: QueueName;
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string) => void;
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
            />
          ))
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onComplete,
  onDefer,
}: {
  task: Task;
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string) => void;
}) {
  const deadline = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(task.deadline));

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
        {task.movementReason}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onComplete(task.id)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-active/30 bg-active/10 px-3 text-sm font-semibold text-active transition hover:bg-active/15"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Done
        </button>
        <button
          type="button"
          onClick={() => onDefer(task.id)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Defer
        </button>
      </div>
    </article>
  );
}
