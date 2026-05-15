import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { getReminderSummary } from './reminders';

const now = new Date('2026-05-15T10:00:00.000Z');

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'task',
    title: 'Task',
    deadline: '2026-05-16T10:00:00.000Z',
    urgency: 'medium',
    estimatedEffortMinutes: 30,
    status: 'open',
    queue: 'active',
    createdAt: '2026-05-10T10:00:00.000Z',
    updatedAt: '2026-05-10T10:00:00.000Z',
    ignoredCount: 0,
    lastInteractionAt: '2026-05-10T10:00:00.000Z',
    movementReason: 'Stable priority',
    ...overrides,
  };
}

describe('getReminderSummary', () => {
  it('groups overdue, due today, and upcoming tasks', () => {
    const summary = getReminderSummary(
      [
        makeTask({ id: 'overdue', deadline: '2026-05-14T10:00:00.000Z' }),
        makeTask({ id: 'today', deadline: '2026-05-15T18:00:00.000Z' }),
        makeTask({ id: 'upcoming', deadline: '2026-05-20T10:00:00.000Z' }),
      ],
      now,
    );

    expect(summary.overdue.map((task) => task.id)).toEqual(['overdue']);
    expect(summary.dueToday.map((task) => task.id)).toEqual(['today']);
    expect(summary.upcoming.map((task) => task.id)).toEqual([
      'today',
      'upcoming',
    ]);
  });
});
