import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { scheduleTasks } from './scheduler';

const now = new Date('2026-05-08T12:00:00.000Z');

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Test task',
    deadline: '2026-05-15T12:00:00.000Z',
    urgency: 'medium',
    estimatedEffortMinutes: 30,
    status: 'open',
    queue: 'active',
    createdAt: '2026-05-01T12:00:00.000Z',
    updatedAt: '2026-05-01T12:00:00.000Z',
    ignoredCount: 0,
    lastInteractionAt: '2026-05-07T12:00:00.000Z',
    movementReason: 'Stable priority',
    ...overrides,
  };
}

describe('scheduleTasks', () => {
  it('promotes near-deadline tasks to the focus queue', () => {
    const result = scheduleTasks(
      [
        makeTask({
          deadline: '2026-05-09T08:00:00.000Z',
          queue: 'active',
        }),
      ],
      now,
    );

    expect(result.queues.focus).toHaveLength(1);
    expect(result.queues.focus[0].movementReason).toBe('Deadline promotion');
    expect(result.events[0]).toMatchObject({
      previousQueue: 'active',
      nextQueue: 'focus',
      reason: 'Deadline promotion',
    });
  });

  it('demotes repeatedly ignored tasks', () => {
    const result = scheduleTasks(
      [
        makeTask({
          ignoredCount: 3,
          queue: 'focus',
          deadline: '2026-05-12T12:00:00.000Z',
        }),
      ],
      now,
    );

    expect(result.queues.active).toHaveLength(1);
    expect(result.queues.active[0].movementReason).toBe(
      'Ignored-task demotion',
    );
  });

  it('boosts starved backlog tasks with aging', () => {
    const result = scheduleTasks(
      [
        makeTask({
          queue: 'backlog',
          lastInteractionAt: '2026-05-01T12:00:00.000Z',
          deadline: '2026-05-20T12:00:00.000Z',
        }),
      ],
      now,
    );

    expect(result.queues.active).toHaveLength(1);
    expect(result.queues.active[0].movementReason).toBe('Aging boost');
  });

  it('excludes completed tasks from active queues', () => {
    const result = scheduleTasks(
      [
        makeTask({
          status: 'completed',
          deadline: '2026-05-09T08:00:00.000Z',
        }),
      ],
      now,
    );

    expect(result.queues.focus).toHaveLength(0);
    expect(result.queues.active).toHaveLength(0);
    expect(result.queues.backlog).toHaveLength(0);
  });
});
