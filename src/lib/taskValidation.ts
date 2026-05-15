import type { TaskEditValues } from './taskActions';

export type TaskValidationErrors = Partial<
  Record<'title' | 'deadline' | 'estimatedEffortMinutes' | 'snoozedUntil', string>
>;

export interface TaskValidationResult {
  isValid: boolean;
  errors: TaskValidationErrors;
}

export function validateTaskValues(
  values: TaskEditValues,
  now = new Date(),
): TaskValidationResult {
  const errors: TaskValidationErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Task title is required.';
  }

  if (!values.deadline) {
    errors.deadline = 'Deadline is required.';
  } else {
    const deadline = new Date(values.deadline);

    if (Number.isNaN(deadline.getTime())) {
      errors.deadline = 'Deadline is not valid.';
    } else if (deadline.getTime() <= now.getTime()) {
      errors.deadline = 'Deadline must be in the future.';
    }
  }

  if (
    !Number.isFinite(values.estimatedEffortMinutes) ||
    values.estimatedEffortMinutes < 15
  ) {
    errors.estimatedEffortMinutes = 'Effort must be at least 15 minutes.';
  }

  if (values.snoozedUntil) {
    const snoozedUntil = new Date(values.snoozedUntil);

    if (Number.isNaN(snoozedUntil.getTime())) {
      errors.snoozedUntil = 'Snooze date is not valid.';
    } else if (snoozedUntil.getTime() <= now.getTime()) {
      errors.snoozedUntil = 'Snooze date must be in the future.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
