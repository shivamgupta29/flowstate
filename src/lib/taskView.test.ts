import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { getVisibleTasks, groupTasksByQueue } from './taskView';

const now = new Date('2026-05-15T10:00:00.000Z');

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'task',
    title: 'Task',
    deadline: '2026-05-20T10:00:00.000Z',
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

describe('task view helpers', () => {
  it('filters by search and sorts by deadline', () => {
    const result = getVisibleTasks(
      [
        makeTask({
          id: 'later',
          title: 'Write paper',
          deadline: '2026-05-20T10:00:00.000Z',
        }),
        makeTask({
          id: 'soon',
          title: 'Write outline',
          deadline: '2026-05-16T10:00:00.000Z',
        }),
      ],
      {
        search: 'write',
        filter: 'all',
        sort: 'deadline',
      },
      now,
    );

    expect(result.map((task) => task.id)).toEqual(['soon', 'later']);
  });

  it('groups visible tasks by queue', () => {
    const grouped = groupTasksByQueue([
      makeTask({ id: 'focus', queue: 'focus' }),
      makeTask({ id: 'backlog', queue: 'backlog' }),
    ]);

    expect(grouped.focus.map((task) => task.id)).toEqual(['focus']);
    expect(grouped.backlog.map((task) => task.id)).toEqual(['backlog']);
  });
});
