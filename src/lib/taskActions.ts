import type {
  QueueName,
  ScheduleEvent,
  Task,
  TaskRecurrence,
  Urgency,
} from '../types';

export interface TaskEditValues {
  title: string;
  deadline: string;
  urgency: Urgency;
  estimatedEffortMinutes: number;
  snoozedUntil?: string;
  recurrence?: TaskRecurrence;
  manualQueueOverride?: QueueName;
}

export function updateTaskDetails(
  tasks: Task[],
  taskId: string,
  values: TaskEditValues,
  now = new Date(),
): Task[] {
  const timestamp = now.toISOString();

  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          title: values.title.trim(),
          deadline: new Date(values.deadline).toISOString(),
          urgency: values.urgency,
          estimatedEffortMinutes: values.estimatedEffortMinutes,
          snoozedUntil: normalizeOptionalDate(values.snoozedUntil),
          recurrence: normalizeRecurrence(values.recurrence),
          manualQueueOverride: values.manualQueueOverride,
          updatedAt: timestamp,
          lastInteractionAt: timestamp,
        }
      : task,
  );
}

export function completeTaskWithRecurrence(
  tasks: Task[],
  taskId: string,
  now = new Date(),
): Task[] {
  const timestamp = now.toISOString();
  const nextTasks: Task[] = [];

  for (const task of tasks) {
    if (task.id !== taskId) {
      nextTasks.push(task);
      continue;
    }

    nextTasks.push({
      ...task,
      status: 'completed',
      completedAt: timestamp,
      updatedAt: timestamp,
      lastInteractionAt: timestamp,
    });

    const recurrence = normalizeRecurrence(task.recurrence);

    if (recurrence.frequency !== 'none') {
      const nextDeadline = getNextRecurringDeadline(
        new Date(task.deadline),
        recurrence,
      );

      nextTasks.push({
        ...task,
        id: `${task.id}-${nextDeadline.getTime()}`,
        deadline: nextDeadline.toISOString(),
        status: 'open',
        queue: 'backlog',
        createdAt: timestamp,
        updatedAt: timestamp,
        ignoredCount: 0,
        lastInteractionAt: timestamp,
        movementReason: 'Stable priority',
        completedAt: undefined,
        snoozedUntil: undefined,
        manualQueueOverride: undefined,
        schedulerScore: undefined,
      });
    }
  }

  return nextTasks;
}

export function snoozeTask(
  tasks: Task[],
  taskId: string,
  snoozedUntil: string,
  now = new Date(),
): Task[] {
  const timestamp = now.toISOString();

  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          snoozedUntil: new Date(snoozedUntil).toISOString(),
          ignoredCount: task.ignoredCount + 1,
          updatedAt: timestamp,
          lastInteractionAt: timestamp,
          movementReason: 'Snoozed',
        }
      : task,
  );
}

export function moveTaskToQueue(
  tasks: Task[],
  taskId: string,
  queue: QueueName,
  now = new Date(),
): Task[] {
  const timestamp = now.toISOString();

  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          queue,
          manualQueueOverride: queue,
          movementReason: 'Manual override',
          updatedAt: timestamp,
          lastInteractionAt: timestamp,
        }
      : task,
  );
}

function normalizeOptionalDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(value).toISOString();
}

function normalizeRecurrence(recurrence?: TaskRecurrence): TaskRecurrence {
  if (!recurrence || recurrence.frequency === 'none') {
    return {
      frequency: 'none',
      interval: 1,
    };
  }

  return {
    frequency: recurrence.frequency,
    interval: Math.max(1, recurrence.interval),
  };
}

function getNextRecurringDeadline(
  deadline: Date,
  recurrence: TaskRecurrence,
): Date {
  const nextDeadline = new Date(deadline);
  const days =
    recurrence.frequency === 'weekly'
      ? 7 * recurrence.interval
      : recurrence.interval;

  nextDeadline.setDate(nextDeadline.getDate() + days);

  return nextDeadline;
}

export function deleteTaskAndEvents(
  tasks: Task[],
  events: ScheduleEvent[],
  taskId: string,
): {
  tasks: Task[];
  events: ScheduleEvent[];
} {
  return {
    tasks: tasks.filter((task) => task.id !== taskId),
    events: events.filter((event) => event.taskId !== taskId),
  };
}

export function restoreTask(
  tasks: Task[],
  taskId: string,
  now = new Date(),
): Task[] {
  const timestamp = now.toISOString();

  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          status: 'open',
          updatedAt: timestamp,
          lastInteractionAt: timestamp,
          movementReason: 'Stable priority',
        }
      : task,
  );
}
