import { describe, expect, it } from 'vitest';
import type { ScheduleEvent, Task } from '../types';
import { createBackupPayload, parseBackupPayload } from './backup';

const task: Task = {
  id: 'task-1',
  title: 'Prepare notes',
  deadline: '2026-05-11T12:00:00.000Z',
  urgency: 'medium',
  estimatedEffortMinutes: 45,
  status: 'open',
  queue: 'active',
  createdAt: '2026-05-10T12:00:00.000Z',
  updatedAt: '2026-05-10T12:00:00.000Z',
  ignoredCount: 0,
  lastInteractionAt: '2026-05-10T12:00:00.000Z',
  movementReason: 'Stable priority',
};

const event: ScheduleEvent = {
  taskId: 'task-1',
  previousQueue: 'backlog',
  nextQueue: 'active',
  reason: 'Aging boost',
  timestamp: '2026-05-10T12:00:00.000Z',
};

describe('backup helpers', () => {
  it('creates an export payload with tasks and schedule events', () => {
    const payload = createBackupPayload(
      [task],
      [event],
      new Date('2026-05-10T13:00:00.000Z'),
    );

    expect(payload).toEqual({
      version: 1,
      exportedAt: '2026-05-10T13:00:00.000Z',
      tasks: [task],
      scheduleEvents: [event],
    });
  });

  it('parses a valid backup payload', () => {
    const payload = createBackupPayload([task], [event]);
    const result = parseBackupPayload(JSON.stringify(payload));

    expect(result).toEqual({
      ok: true,
      data: payload,
    });
  });

  it('returns an error for invalid JSON', () => {
    const result = parseBackupPayload('{not-json');

    expect(result).toEqual({
      ok: false,
      error: 'Backup file is not valid JSON.',
    });
  });

  it('returns an error for invalid backup shape', () => {
    const result = parseBackupPayload(JSON.stringify({ version: 1 }));

    expect(result).toEqual({
      ok: false,
      error: 'Backup file is missing FlowState data.',
    });
  });
});
