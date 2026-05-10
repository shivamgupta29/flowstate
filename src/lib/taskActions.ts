import type { ScheduleEvent, Task, Urgency } from '../types';

export interface TaskEditValues {
  title: string;
  deadline: string;
  urgency: Urgency;
  estimatedEffortMinutes: number;
}

export function updateTaskDetails(
  tasks: Task[],
  taskId: string,
  values: TaskEditValues,
  now = new Date(),
): Task[] {
  const timestamp = now.toISOString();

  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          title: values.title.trim(),
          deadline: new Date(values.deadline).toISOString(),
          urgency: values.urgency,
          estimatedEffortMinutes: values.estimatedEffortMinutes,
          updatedAt: timestamp,
          lastInteractionAt: timestamp,
        }
      : task,
  );
}

export function deleteTaskAndEvents(
  tasks: Task[],
  events: ScheduleEvent[],
  taskId: string,
): {
  tasks: Task[];
  events: ScheduleEvent[];
} {
  return {
    tasks: tasks.filter((task) => task.id !== taskId),
    events: events.filter((event) => event.taskId !== taskId),
  };
}

export function restoreTask(
  tasks: Task[],
  taskId: string,
  now = new Date(),
): Task[] {
  const timestamp = now.toISOString();

  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          status: 'open',
          updatedAt: timestamp,
          lastInteractionAt: timestamp,
          movementReason: 'Stable priority',
        }
      : task,
  );
}
