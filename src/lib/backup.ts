import type { MovementReason, QueueName, ScheduleEvent, Task } from '../types';

export interface FlowStateBackup {
  version: 1;
  exportedAt: string;
  tasks: Task[];
  scheduleEvents: ScheduleEvent[];
}

export type BackupParseResult =
  | {
      ok: true;
      data: FlowStateBackup;
    }
  | {
      ok: false;
      error: string;
    };

const queueNames: QueueName[] = ['focus', 'active', 'backlog'];
const movementReasons: MovementReason[] = [
  'Deadline promotion',
  'Ignored-task demotion',
  'Aging boost',
  'Manual override',
  'Snoozed',
  'Scheduler score',
  'Stable priority',
];

export function createBackupPayload(
  tasks: Task[],
  scheduleEvents: ScheduleEvent[],
  now = new Date(),
): FlowStateBackup {
  return {
    version: 1,
    exportedAt: now.toISOString(),
    tasks,
    scheduleEvents,
  };
}

export function parseBackupPayload(rawValue: string): BackupParseResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return {
      ok: false,
      error: 'Backup file is not valid JSON.',
    };
  }

  if (!isRecord(parsed)) {
    return {
      ok: false,
      error: 'Backup file has an invalid shape.',
    };
  }

  if (parsed.version !== 1) {
    return {
      ok: false,
      error: 'Backup version is not supported.',
    };
  }

  if (
    typeof parsed.exportedAt !== 'string' ||
    !Array.isArray(parsed.tasks) ||
    !Array.isArray(parsed.scheduleEvents)
  ) {
    return {
      ok: false,
      error: 'Backup file is missing FlowState data.',
    };
  }

  if (!parsed.tasks.every(isTask) || !parsed.scheduleEvents.every(isEvent)) {
    return {
      ok: false,
      error: 'Backup file contains invalid tasks or schedule events.',
    };
  }

  return {
    ok: true,
    data: {
      version: 1,
      exportedAt: parsed.exportedAt,
      tasks: parsed.tasks,
      scheduleEvents: parsed.scheduleEvents,
    },
  };
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.deadline === 'string' &&
    (value.urgency === 'low' ||
      value.urgency === 'medium' ||
      value.urgency === 'high') &&
    typeof value.estimatedEffortMinutes === 'number' &&
    (value.status === 'open' || value.status === 'completed') &&
    queueNames.includes(value.queue as QueueName) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    typeof value.ignoredCount === 'number' &&
    typeof value.lastInteractionAt === 'string' &&
    movementReasons.includes(value.movementReason as MovementReason)
  );
}

function isEvent(value: unknown): value is ScheduleEvent {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.taskId === 'string' &&
    queueNames.includes(value.previousQueue as QueueName) &&
    queueNames.includes(value.nextQueue as QueueName) &&
    movementReasons.includes(value.reason as MovementReason) &&
    typeof value.timestamp === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
