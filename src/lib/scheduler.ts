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
  low: 0,
  medium: 1,
  high: 2,
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

    const { queue, reason } = calculateQueue(task, now);
    const scheduledTask: Task = {
      ...task,
      queue,
      movementReason: reason,
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

function calculateQueue(task: Task, now: Date): {
  queue: QueueName;
  reason: MovementReason;
} {
  const deadline = new Date(task.deadline);
  const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / HOURS;
  const daysSinceInteraction =
    (now.getTime() - new Date(task.lastInteractionAt).getTime()) / DAYS;

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
    (hoursUntilDeadline <= 72 && task.urgency === 'high')
  ) {
    return {
      queue: 'focus',
      reason: 'Deadline promotion',
    };
  }

  if (task.urgency === 'high' || hoursUntilDeadline <= 120) {
    return {
      queue: task.queue === 'focus' ? 'focus' : 'active',
      reason: task.queue === 'active' ? 'Stable priority' : 'Deadline promotion',
    };
  }

  return {
    queue: task.queue,
    reason: 'Stable priority',
  };
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
