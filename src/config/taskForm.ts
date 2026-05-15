import type { TaskEditValues } from '../lib/taskActions';

export const defaultTaskForm: TaskEditValues = {
  title: '',
  deadline: '',
  urgency: 'medium',
  estimatedEffortMinutes: 45,
  snoozedUntil: '',
  recurrence: {
    frequency: 'none',
    interval: 1,
  },
  manualQueueOverride: undefined,
};
