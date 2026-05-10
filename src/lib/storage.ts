import type { ScheduleEvent, Task } from '../types';
import { seedTasks } from './seedTasks';

const TASKS_STORAGE_KEY = 'flowstate.tasks.v1';
const EVENTS_STORAGE_KEY = 'flowstate.scheduleEvents.v1';

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') {
    return seedTasks;
  }

  const storedValue = window.localStorage.getItem(TASKS_STORAGE_KEY);

  if (!storedValue) {
    return seedTasks;
  }

  try {
    const parsed = JSON.parse(storedValue) as Task[];
    return Array.isArray(parsed) ? parsed : seedTasks;
  } catch {
    return seedTasks;
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export function loadScheduleEvents(): ScheduleEvent[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const storedValue = window.localStorage.getItem(EVENTS_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue) as ScheduleEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScheduleEvents(events: ScheduleEvent[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

export function appendScheduleEvents(
  currentEvents: ScheduleEvent[],
  nextEvents: ScheduleEvent[],
): ScheduleEvent[] {
  const acceptedEvents = nextEvents.filter((event) => {
    const latestForTask = findLatestEventForTask(currentEvents, event.taskId);

    if (!latestForTask) {
      return true;
    }

    return !isSameMovement(latestForTask, event);
  });

  return [...acceptedEvents, ...currentEvents].slice(0, 20);
}

export function clearTasks(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(TASKS_STORAGE_KEY);
  window.localStorage.removeItem(EVENTS_STORAGE_KEY);
}

function isSameMovement(left: ScheduleEvent, right: ScheduleEvent): boolean {
  return (
    left.taskId === right.taskId &&
    left.previousQueue === right.previousQueue &&
    left.nextQueue === right.nextQueue &&
    left.reason === right.reason
  );
}

function findLatestEventForTask(
  events: ScheduleEvent[],
  taskId: string,
): ScheduleEvent | undefined {
  for (let index = 0; index < events.length; index += 1) {
    if (events[index].taskId === taskId) {
      return events[index];
    }
  }

  return undefined;
}
