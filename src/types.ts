export type QueueName = 'focus' | 'active' | 'backlog';

export type TaskStatus = 'open' | 'completed';

export type Urgency = 'low' | 'medium' | 'high';

export type MovementReason =
  | 'Deadline promotion'
  | 'Ignored-task demotion'
  | 'Aging boost'
  | 'Stable priority';

export interface Task {
  id: string;
  title: string;
  deadline: string;
  urgency: Urgency;
  estimatedEffortMinutes: number;
  status: TaskStatus;
  queue: QueueName;
  createdAt: string;
  updatedAt: string;
  ignoredCount: number;
  lastInteractionAt: string;
  movementReason: MovementReason;
}

export interface ScheduleEvent {
  taskId: string;
  previousQueue: QueueName;
  nextQueue: QueueName;
  reason: MovementReason;
  timestamp: string;
}

export interface ScheduledQueues {
  focus: Task[];
  active: Task[];
  backlog: Task[];
}

export interface ScheduleResult {
  tasks: Task[];
  queues: ScheduledQueues;
  events: ScheduleEvent[];
}
