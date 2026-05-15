import type { Task } from '../types';

const now = new Date();

function daysFromNow(days: number): string {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}
// A set of example tasks to populate the app on first load, demonstrating various states and movement reasons.
export const seedTasks: Task[] = [
  {
    id: 'task-architecture-notes',
    title: 'Draft MLFQ scheduler notes',
    deadline: daysFromNow(1),
    urgency: 'high',
    estimatedEffortMinutes: 45,
    status: 'open',
    queue: 'active',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    ignoredCount: 0,
    lastInteractionAt: daysAgo(1),
    movementReason: 'Deadline promotion',
  },
  {
    id: 'task-assignment-pdf',
    title: 'Open the assignment PDF before crisis mode',
    deadline: daysFromNow(4),
    urgency: 'medium',
    estimatedEffortMinutes: 90,
    status: 'open',
    queue: 'focus',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
    ignoredCount: 3,
    lastInteractionAt: daysAgo(1),
    movementReason: 'Ignored-task demotion',
  },
  {
    id: 'task-read-research',
    title: 'Read scheduling fairness paper',
    deadline: daysFromNow(9),
    urgency: 'low',
    estimatedEffortMinutes: 60,
    status: 'open',
    queue: 'backlog',
    createdAt: daysAgo(9),
    updatedAt: daysAgo(6),
    ignoredCount: 1,
    lastInteractionAt: daysAgo(7),
    movementReason: 'Aging boost',
  },
  {
    id: 'task-dashboard-copy',
    title: 'Polish dashboard labels',
    deadline: daysFromNow(6),
    urgency: 'medium',
    estimatedEffortMinutes: 30,
    status: 'open',
    queue: 'active',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    ignoredCount: 0,
    lastInteractionAt: daysAgo(1),
    movementReason: 'Stable priority',
  },
];
