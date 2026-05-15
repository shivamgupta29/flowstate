import type { Task } from '../types';

export interface ReminderSummary {
  overdue: Task[];
  dueToday: Task[];
  upcoming: Task[];
}

const DAYS = 24 * 60 * 60 * 1000;

export function getReminderSummary(
  tasks: Task[],
  now = new Date(),
): ReminderSummary {
  const openTasks = tasks.filter((task) => task.status === 'open');

  return {
    overdue: openTasks.filter(
      (task) => new Date(task.deadline).getTime() < now.getTime(),
    ),
    dueToday: openTasks.filter((task) =>
      isSameDay(new Date(task.deadline), now),
    ),
    upcoming: openTasks.filter((task) => {
      const deadline = new Date(task.deadline).getTime();
      return deadline > now.getTime() && deadline <= now.getTime() + 7 * DAYS;
    }),
  };
}

function isSameDay(left: Date, right: Date): boolean {
  return left.toDateString() === right.toDateString();
}
