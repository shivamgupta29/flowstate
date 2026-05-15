import type { QueueName, Task } from '../types';

export type TaskFilter = 'all' | 'due-today' | 'overdue' | 'snoozed';
export type TaskSort = 'scheduler' | 'deadline' | 'urgency' | 'effort';

const urgencyWeight: Record<Task['urgency'], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export interface TaskViewOptions {
  search: string;
  filter: TaskFilter;
  sort: TaskSort;
}

export function getVisibleTasks(
  tasks: Task[],
  options: TaskViewOptions,
  now = new Date(),
): Task[] {
  const query = options.search.trim().toLowerCase();

  return [...tasks]
    .filter((task) => {
      if (query && !task.title.toLowerCase().includes(query)) {
        return false;
      }

      if (options.filter === 'overdue') {
        return new Date(task.deadline).getTime() < now.getTime();
      }

      if (options.filter === 'due-today') {
        return isSameDay(new Date(task.deadline), now);
      }

      if (options.filter === 'snoozed') {
        return Boolean(
          task.snoozedUntil &&
            new Date(task.snoozedUntil).getTime() > now.getTime(),
        );
      }

      return true;
    })
    .sort((left, right) => compareTasks(left, right, options.sort));
}

export function groupTasksByQueue(tasks: Task[]): Record<QueueName, Task[]> {
  return {
    focus: tasks.filter((task) => task.queue === 'focus'),
    active: tasks.filter((task) => task.queue === 'active'),
    backlog: tasks.filter((task) => task.queue === 'backlog'),
  };
}

function compareTasks(left: Task, right: Task, sort: TaskSort): number {
  if (sort === 'deadline') {
    return new Date(left.deadline).getTime() - new Date(right.deadline).getTime();
  }

  if (sort === 'urgency') {
    return urgencyWeight[right.urgency] - urgencyWeight[left.urgency];
  }

  if (sort === 'effort') {
    return left.estimatedEffortMinutes - right.estimatedEffortMinutes;
  }

  return (right.schedulerScore ?? 0) - (left.schedulerScore ?? 0);
}

function isSameDay(left: Date, right: Date): boolean {
  return left.toDateString() === right.toDateString();
}

