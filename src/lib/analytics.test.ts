import { describe, expect, it } from 'vitest';
import type { ScheduleEvent, Task } from '../types';
import { calculateAnalytics } from './analytics';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Task',
    deadline: '2026-05-20T12:00:00.000Z',
    urgency: 'medium',
    estimatedEffortMinutes: 30,
    status: 'open',
    queue: 'active',
    createdAt: '2026-05-01T12:00:00.000Z',
    updatedAt: '2026-05-01T12:00:00.000Z',
    ignoredCount: 0,
    lastInteractionAt: '2026-05-01T12:00:00.000Z',
    movementReason: 'Stable priority',
    ...overrides,
  };
}

describe('calculateAnalytics', () => {
  it('computes queue distribution from open tasks', () => {
    const analytics = calculateAnalytics(
      [
        makeTask({ id: 'focus-task', queue: 'focus' }),
        makeTask({ id: 'active-task', queue: 'active' }),
        makeTask({ id: 'done-task', queue: 'backlog', status: 'completed' }),
      ],
      [],
    );

    expect(analytics.queueDistribution).toEqual({
      focus: 1,
      active: 1,
      backlog: 0,
    });
    expect(analytics.openCount).toBe(2);
    expect(analytics.completedCount).toBe(1);
  });

  it('counts movement reasons from schedule events', () => {
    const events: ScheduleEvent[] = [
      {
        taskId: 'task-1',
        previousQueue: 'backlog',
        nextQueue: 'active',
        reason: 'Aging boost',
        timestamp: '2026-05-10T12:00:00.000Z',
      },
      {
        taskId: 'task-2',
        previousQueue: 'active',
        nextQueue: 'focus',
        reason: 'Deadline promotion',
        timestamp: '2026-05-10T13:00:00.000Z',
      },
    ];

    const analytics = calculateAnalytics([makeTask()], events);

    expect(analytics.movementReasonTotals['Aging boost']).toBe(1);
    expect(analytics.movementReasonTotals['Deadline promotion']).toBe(1);
    expect(analytics.movementCount).toBe(2);
  });
});
