import type {
  MovementReason,
  QueueName,
  ScheduleEvent,
  ScheduleResult,
  ScheduledQueues,
  Task,
} from '../types';

const HOURS = 60 * 60 * 1000;
const DAYS = 24 * HOURS;

const urgencyWeight: Record<Task['urgency'], number> = {
  low: 5,
  medium: 15,
  high: 30,
};

const queueRank: Record<QueueName, number> = {
  focus: 0,
  active: 1,
  backlog: 2,
};

export function scheduleTasks(tasks: Task[], now = new Date()): ScheduleResult {
  const timestamp = now.toISOString();
  const events: ScheduleEvent[] = [];

  const scheduledTasks = tasks.map((task) => {
    if (task.status === 'completed') {
      return task;
    }

    const score = calculateSchedulerScore(task, now);
    const { queue, reason } = calculateQueue(task, now, score);
    const scheduledTask: Task = {
      ...task,
      queue,
      movementReason: reason,
      schedulerScore: score,
    };

    if (queue !== task.queue) {
      events.push({
        taskId: task.id,
        previousQueue: task.queue,
        nextQueue: queue,
        reason,
        timestamp,
      });
    }

    return scheduledTask;
  });

  const openTasks = scheduledTasks.filter((task) => task.status === 'open');
  const queues: ScheduledQueues = {
    focus: sortQueue(openTasks.filter((task) => task.queue === 'focus')),
    active: sortQueue(openTasks.filter((task) => task.queue === 'active')),
    backlog: sortQueue(openTasks.filter((task) => task.queue === 'backlog')),
  };

  return {
    tasks: scheduledTasks,
    queues,
    events,
  };
}

function calculateQueue(task: Task, now: Date, score: number): {
  queue: QueueName;
  reason: MovementReason;
} {
  const deadline = new Date(task.deadline);
  const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / HOURS;
  const daysSinceInteraction =
    (now.getTime() - new Date(task.lastInteractionAt).getTime()) / DAYS;

  if (
    task.snoozedUntil &&
    new Date(task.snoozedUntil).getTime() > now.getTime()
  ) {
    return {
      queue: 'backlog',
      reason: 'Snoozed',
    };
  }

  if (task.manualQueueOverride) {
    return {
      queue: task.manualQueueOverride,
      reason: 'Manual override',
    };
  }

  if (task.ignoredCount >= 3 && hoursUntilDeadline > 24) {
    return {
      queue: demote(task.queue),
      reason: 'Ignored-task demotion',
    };
  }

  if (task.queue === 'backlog' && daysSinceInteraction >= 5) {
    return {
      queue: 'active',
      reason: 'Aging boost',
    };
  }

  if (
    hoursUntilDeadline <= 24 ||
    (hoursUntilDeadline <= 72 && task.urgency === 'high') ||
    score >= 80
  ) {
    return {
      queue: 'focus',
      reason: 'Deadline promotion',
    };
  }

  if (task.urgency === 'high' || hoursUntilDeadline <= 120 || score >= 45) {
    return {
      queue: task.queue === 'focus' ? 'focus' : 'active',
      reason: task.queue === 'active' ? 'Scheduler score' : 'Scheduler score',
    };
  }

  return {
    queue: task.queue,
    reason: 'Stable priority',
  };
}

export function calculateSchedulerScore(task: Task, now = new Date()): number {
  const deadline = new Date(task.deadline);
  const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / HOURS;
  const daysSinceCreated =
    (now.getTime() - new Date(task.createdAt).getTime()) / DAYS;
  const daysSinceInteraction =
    (now.getTime() - new Date(task.lastInteractionAt).getTime()) / DAYS;

  if (
    task.snoozedUntil &&
    new Date(task.snoozedUntil).getTime() > now.getTime()
  ) {
    return 0;
  }

  const deadlineScore =
    hoursUntilDeadline <= 0
      ? 45
      : hoursUntilDeadline <= 24
        ? 40
        : hoursUntilDeadline <= 72
          ? 28
          : hoursUntilDeadline <= 120
            ? 18
            : 6;
  const ignoredScore = Math.min(task.ignoredCount * 8, 24);
  const agingScore = Math.min(daysSinceInteraction * 4 + daysSinceCreated, 24);
  const recurrenceScore =
    task.recurrence && task.recurrence.frequency !== 'none' ? 6 : 0;

  return Math.round(
    Math.min(
      100,
      urgencyWeight[task.urgency] +
        deadlineScore +
        ignoredScore +
        agingScore +
        recurrenceScore,
    ),
  );
}

function demote(queue: QueueName): QueueName {
  if (queue === 'focus') {
    return 'active';
  }

  return 'backlog';
}

function sortQueue(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const deadlineDelta =
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime();

    if (deadlineDelta !== 0) {
      return deadlineDelta;
    }

    const urgencyDelta = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];

    if (urgencyDelta !== 0) {
      return urgencyDelta;
    }

    return queueRank[a.queue] - queueRank[b.queue];
  });
}
