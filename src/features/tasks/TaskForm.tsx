import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import { defaultTaskForm } from '../../config/taskForm';
import type { TaskEditValues } from '../../lib/taskActions';
import {
  validateTaskValues,
  type TaskValidationErrors,
} from '../../lib/taskValidation';
import type { QueueName, RecurrenceFrequency, Urgency } from '../../types';
import { ValidationMessage } from '../../components/ValidationMessage';

export function TaskForm({
  onCreate,
}: {
  onCreate: (form: TaskEditValues) => void;
}) {
  const [form, setForm] = useState(defaultTaskForm);
  const [errors, setErrors] = useState<TaskValidationErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateTaskValues(form);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
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
      <ValidationMessage message={errors.title} />

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
      <ValidationMessage message={errors.deadline} />

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
          <ValidationMessage message={errors.estimatedEffortMinutes} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="recurrence"
          >
            Repeat
          </label>
          <select
            id="recurrence"
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
            htmlFor="override"
          >
            Queue override
          </label>
          <select
            id="override"
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
        htmlFor="snooze"
      >
        Snooze until
      </label>
      <input
        id="snooze"
        type="datetime-local"
        value={form.snoozedUntil ?? ''}
        onChange={(event) =>
          setForm({ ...form, snoozedUntil: event.target.value })
        }
        className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-active focus:ring-2 focus:ring-active/20"
      />
      <ValidationMessage message={errors.snoozedUntil} />

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
