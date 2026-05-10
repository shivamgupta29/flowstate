import type { MovementReason, QueueName, ScheduleEvent, Task } from '../types';

export interface AnalyticsSummary {
  openCount: number;
  completedCount: number;
  queuedEffortMinutes: number;
  deferralCount: number;
  movementCount: number;
  queueDistribution: Record<QueueName, number>;
  movementReasonTotals: Record<MovementReason, number>;
}

const movementReasons: MovementReason[] = [
  'Deadline promotion',
  'Ignored-task demotion',
  'Aging boost',
  'Stable priority',
];

export function calculateAnalytics(
  tasks: Task[],
  events: ScheduleEvent[],
): AnalyticsSummary {
  const openTasks = tasks.filter((task) => task.status === 'open');

  return {
    openCount: openTasks.length,
    completedCount: tasks.length - openTasks.length,
    queuedEffortMinutes: openTasks.reduce(
      (total, task) => total + task.estimatedEffortMinutes,
      0,
    ),
    deferralCount: tasks.reduce((total, task) => total + task.ignoredCount, 0),
    movementCount: events.length,
    queueDistribution: {
      focus: openTasks.filter((task) => task.queue === 'focus').length,
      active: openTasks.filter((task) => task.queue === 'active').length,
      backlog: openTasks.filter((task) => task.queue === 'backlog').length,
    },
    movementReasonTotals: movementReasons.reduce(
      (totals, reason) => ({
        ...totals,
        [reason]: events.filter((event) => event.reason === reason).length,
      }),
      {} as Record<MovementReason, number>,
    ),
  };
}
