import { describe, expect, it } from 'vitest';
import type { ScheduleEvent, Task } from '../types';
import {
  deleteTaskAndEvents,
  restoreTask,
  updateTaskDetails,
} from './taskActions';

const now = new Date('2026-05-10T12:00:00.000Z');

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Original task',
    deadline: '2026-05-20T12:00:00.000Z',
    urgency: 'medium',
    estimatedEffortMinutes: 30,
    status: 'open',
    queue: 'backlog',
    createdAt: '2026-05-01T12:00:00.000Z',
    updatedAt: '2026-05-01T12:00:00.000Z',
    ignoredCount: 0,
    lastInteractionAt: '2026-05-01T12:00:00.000Z',
    movementReason: 'Stable priority',
    ...overrides,
  };
}

describe('task actions', () => {
  it('updates editable task fields and interaction timestamps', () => {
    const result = updateTaskDetails(
      [makeTask()],
      'task-1',
      {
        title: 'Updated task',
        deadline: '2026-05-11T12:00:00.000Z',
        urgency: 'high',
        estimatedEffortMinutes: 60,
      },
      now,
    );

    expect(result[0]).toMatchObject({
      title: 'Updated task',
      deadline: '2026-05-11T12:00:00.000Z',
      urgency: 'high',
      estimatedEffortMinutes: 60,
      updatedAt: now.toISOString(),
      lastInteractionAt: now.toISOString(),
    });
  });

  it('deletes a task and its movement events', () => {
    const events: ScheduleEvent[] = [
      {
        taskId: 'task-1',
        previousQueue: 'backlog',
        nextQueue: 'active',
        reason: 'Aging boost',
        timestamp: now.toISOString(),
      },
      {
        taskId: 'task-2',
        previousQueue: 'active',
        nextQueue: 'focus',
        reason: 'Deadline promotion',
        timestamp: now.toISOString(),
      },
    ];

    const result = deleteTaskAndEvents(
      [makeTask(), makeTask({ id: 'task-2' })],
      events,
      'task-1',
    );

    expect(result.tasks).toHaveLength(1);
    expect(result.events).toEqual([events[1]]);
  });

  it('restores completed tasks to open scheduling', () => {
    const result = restoreTask(
      [
        makeTask({
          status: 'completed',
          updatedAt: '2026-05-01T12:00:00.000Z',
        }),
      ],
      'task-1',
      now,
    );

    expect(result[0]).toMatchObject({
      status: 'open',
      updatedAt: now.toISOString(),
      lastInteractionAt: now.toISOString(),
    });
  });
});
