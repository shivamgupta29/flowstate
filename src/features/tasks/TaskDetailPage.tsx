import { FormEvent, useState } from 'react';
import { Check, Save, Trash2, Undo2, X } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { ValidationMessage } from '../../components/ValidationMessage';
import { formatQueueName } from '../../config/queues';
import type { TaskEditValues } from '../../lib/taskActions';
import {
  validateTaskValues,
  type TaskValidationErrors,
} from '../../lib/taskValidation';
import type {
  QueueName,
  RecurrenceFrequency,
  ScheduleEvent,
  Task,
  Urgency,
} from '../../types';
import { toDateTimeInputValue } from '../../utils/date';
import { MovementEventItem } from '../dashboard/MovementEventItem';

export function TaskDetailPage({
  task,
  events,
  onBack,
  onSave,
  onComplete,
  onRestore,
  onDelete,
  onMove,
  onSnooze,
}: {
  task: Task;
  events: ScheduleEvent[];
  onBack: () => void;
  onSave: (values: TaskEditValues) => void;
  onComplete: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onMove: (queue: QueueName) => void;
  onSnooze: (snoozedUntil: string) => void;
}) {
  const [form, setForm] = useState(() => ({
    title: task.title,
    deadline: toDateTimeInputValue(task.deadline),
    urgency: task.urgency,
    estimatedEffortMinutes: task.estimatedEffortMinutes,
    snoozedUntil: task.snoozedUntil
      ? toDateTimeInputValue(task.snoozedUntil)
      : '',
    recurrence: task.recurrence ?? {
      frequency: 'none' as const,
      interval: 1,
    },
    manualQueueOverride: task.manualQueueOverride,
  }));
  const [errors, setErrors] = useState<TaskValidationErrors>({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateTaskValues(form);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSave(form);
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="border-b-0 pb-0">
            <PageHeader title="Task details" onBack={onBack} />
          </div>

          {task.status === 'completed' ? (
            <button
              type="button"
              onClick={onRestore}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-active/30 bg-active/10 px-4 text-sm font-semibold text-active transition hover:bg-active/15"
            >
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              Restore task
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-active/30 bg-active/10 px-4 text-sm font-semibold text-active transition hover:bg-active/15"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Mark done
            </button>
          )}
        </div>

        <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="edit-title"
            >
              Task
            </label>
            <input
              id="edit-title"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
            />
            <ValidationMessage message={errors.title} />

            <label
              className="mt-4 block text-sm font-medium text-slate-700"
              htmlFor="edit-deadline"
            >
              Deadline
            </label>
            <input
              id="edit-deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={(event) =>
                setForm({ ...form, deadline: event.target.value })
              }
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
            />
            <ValidationMessage message={errors.deadline} />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700"
                  htmlFor="edit-urgency"
                >
                  Urgency
                </label>
                <select
                  id="edit-urgency"
                  value={form.urgency}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      urgency: event.target.value as Urgency,
                    })
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
                  htmlFor="edit-effort"
                >
                  Effort
                </label>
                <input
                  id="edit-effort"
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
                <ValidationMessage message={errors.estimatedEffortMinutes} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700"
                  htmlFor="edit-recurrence"
                >
                  Repeat
                </label>
                <select
                  id="edit-recurrence"
                  value={form.recurrence?.frequency ?? 'none'}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      recurrence: {
                        frequency: event.target.value as RecurrenceFrequency,
                        interval: form.recurrence?.interval ?? 1,
                      },
                    })
                  }
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
                >
                  <option value="none">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-slate-700"
                  htmlFor="edit-override"
                >
                  Queue override
                </label>
                <select
                  id="edit-override"
                  value={form.manualQueueOverride ?? ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      manualQueueOverride:
                        event.target.value === ''
                          ? undefined
                          : (event.target.value as QueueName),
                    })
                  }
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
                >
                  <option value="">Automatic</option>
                  <option value="focus">Focus</option>
                  <option value="active">Active</option>
                  <option value="backlog">Backlog</option>
                </select>
              </div>
            </div>

            <label
              className="mt-4 block text-sm font-medium text-slate-700"
              htmlFor="edit-snooze"
            >
              Snooze until
            </label>
            <input
              id="edit-snooze"
              type="datetime-local"
              value={form.snoozedUntil ?? ''}
              onChange={(event) =>
                setForm({ ...form, snoozedUntil: event.target.value })
              }
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
            />
            <ValidationMessage message={errors.snoozedUntil} />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save changes
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Queue state</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <p>Current queue: {formatQueueName(task.queue)}</p>
              <p>Status: {task.status}</p>
              <p>Ignored: {task.ignoredCount}x</p>
              <p>Score: {task.schedulerScore ?? 0}</p>
              <p>
                Repeat:{' '}
                {task.recurrence?.frequency && task.recurrence.frequency !== 'none'
                  ? task.recurrence.frequency
                  : 'none'}
              </p>
              <p>
                Snoozed:{' '}
                {task.snoozedUntil
                  ? new Date(task.snoozedUntil).toLocaleString()
                  : 'no'}
              </p>
              <p>Why here: {task.movementReason}</p>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-ink">Manual move</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(['focus', 'active', 'backlog'] as QueueName[]).map((queue) => (
                  <button
                    key={queue}
                    type="button"
                    onClick={() => onMove(queue)}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold capitalize text-slate-700 transition hover:bg-slate-50"
                  >
                    {queue}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  onSnooze(tomorrow.toISOString());
                }}
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Snooze 1 day
              </button>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-ink">
                Movement history
              </h3>
              {events.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  No movement events yet.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <MovementEventItem
                      key={`${event.taskId}-${event.previousQueue}-${event.nextQueue}-${event.reason}-${event.timestamp}`}
                      event={event}
                      taskTitle={task.title}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              {isConfirmingDelete ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm font-semibold text-red-700">
                    Delete this task permanently?
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onDelete}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Keep
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete task
                </button>
              )}
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
